import { XmlFieldMeasure, XmlSummaryOrientation } from "../core/enums";
import { IAggregatedField, IXmlSummary, IXmlSummaryField, IXmlSummaryFormatOptions } from "../core/interfaces";
import { Dictionary, SummaryDictionary } from "../core/Dictionary";
import { parseXmlSummary } from '../utils/parseXmlSummary';
import { parseSpecAndOptions } from "../utils/parseSpecAndOptions";

function formatAggregatedValue(
  value: number,
  fieldSpec: IXmlSummaryField,
  options: {
    roundDecimals?: number;
    currency?: string;
    showCurrencySymbol?: boolean;
    percentageFields?: string[];
    integerFields?: string[];
  }
): string | number {
  let result: string | number = value;

  if (options.integerFields?.includes(fieldSpec.name)) {
    result = new Intl.NumberFormat("es-DO", {
      style: "decimal",
      useGrouping: true,
      maximumFractionDigits: 0
    }).format(value);
  } else if (options.currency) {
    const raw = new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: options.currency
    }).format(value);

    result = options.showCurrencySymbol ? raw : raw.replace(/[^0-9,.]/g, '');
  } else if (options.roundDecimals !== undefined) {
    result = parseFloat(value.toFixed(options.roundDecimals));
  }

  if (options.percentageFields?.includes(fieldSpec.name)) {
    result = `${result}%`;
  }

  return result;
}


export class XmlSummarizer {
    /**
     * Processes a raw XML string using a structured IXmlSummary object to compute
     * grouped and formatted summary data. Supports numeric aggregations like sum, count,
     * average, min, max, standard deviation, and optional output formatting.
     *
     * Example:
     *   const summary = getSummaryFromXml(xmlData, summarySpec, false, { roundDecimals: 2 });
     *
     * @param xmlFile - The raw XML string to parse and summarize.
     * @param summarySpecs - Parsed summary specification, including target node, grouping field, and fields to aggregate.
     * @param debug - Enables verbose logging or diagnostic output (optional, default: false).
     * @param formatOptions - Optional formatting and output behavior (e.g., decimal rounding, currency).
     * @returns A dictionary grouping summary results by key, or a JSON string if `asJson` is enabled.
     *
     * @throws If the XML is invalid or aggregation encounters malformed values.
     */
    public static getSummaryFromXml(
        xmlFile: string,
        summarySpecs: IXmlSummary,
        debug: boolean = false,
        formatOptions: IXmlSummaryFormatOptions = {} = {}
    ): SummaryDictionary | string {

        const {
            roundDecimals,
            currency,
            showCurrencySymbol,
            asJson,
            percentageFields,
            integerFields,
            sortResults,
            treatMissingAsZero = true 
        } = formatOptions;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlFile, 'application/xml');

        const targetNodes = xmlDoc.querySelectorAll(summarySpecs.targetNode);
        if (debug) console.warn(`Found ${targetNodes.length} nodes for targetNode: ${summarySpecs.targetNode}`);

        const dictionaryKey = summarySpecs.groupingField === "*" ? summarySpecs.groupingDisplayName : "Ungrouped";
        
        const summaryDictionary: SummaryDictionary = new Dictionary();
        
        const aggregationStorage = new Dictionary<string, Record<string, { sum: number; count: number; min: number; max: number; avg: number; stdDev: number }>>();

        targetNodes.forEach(targetNode => {
            let groupingValue: string;
            if (summarySpecs.groupingField === "*") {
                groupingValue = dictionaryKey ?? "Ungrouped";
            } else {
                const groupingNode = summarySpecs.groupingField ? targetNode.querySelector(summarySpecs.groupingField) : null;
                groupingValue = groupingNode?.textContent?.trim() || "N/A";
            }

            if (!summaryDictionary.has(groupingValue)) {
                summaryDictionary.set(groupingValue, []);
                aggregationStorage.set(groupingValue, {});
            }

            // This removes redundant DOM queries and speeds up field extraction, especially across large datasets or high field-count summaries.
            const nodeMap = new Map<string, string>();
            Array.from(targetNode.children).forEach(child => {
                nodeMap.set(child.nodeName, child.textContent?.trim() || "N/A");
            });

            summarySpecs.fields.forEach(fieldSpec => {

                const matchingNodes = Array.from(targetNode.querySelectorAll(fieldSpec.name));
                let numericValues = matchingNodes
                .map(n => parseFloat(n.textContent?.trim() || 'NaN'))
                .filter(v => !isNaN(v));

                // Optional fallback to 0 if no values are found
                if (numericValues.length === 0 && treatMissingAsZero) {
                numericValues = [0];
                }
                if (numericValues.length === 0) return; // skip only if 0s are not allowed and no valid number

                const aggGroup = aggregationStorage.get(groupingValue)!;
                const fieldKey = `${fieldSpec.name}__${fieldSpec.measure}`;
                if (!aggGroup[fieldKey]) {
                aggGroup[fieldKey] = { sum: 0, count: 0, min: Infinity, max: -Infinity, avg: 0, stdDev: 0 };
                }
                const fieldStats = aggGroup[fieldKey];

                numericValues.forEach(numericValue => {
                fieldStats.sum += numericValue;
                fieldStats.count += 1;
                fieldStats.min = Math.min(fieldStats.min, numericValue);
                fieldStats.max = Math.max(fieldStats.max, numericValue);

                const prevAvg = fieldStats.avg;
                fieldStats.avg = fieldStats.sum / fieldStats.count;
                const varianceIncrement = (numericValue - prevAvg) * (numericValue - fieldStats.avg);
                fieldStats.stdDev = Math.sqrt((fieldStats.stdDev * (fieldStats.count - 1) + varianceIncrement) / fieldStats.count);
                });
                    
            });
        });

        // Aggregate values correctly into the dictionary
        for (const [group, fields] of aggregationStorage.entries()) {
            const aggregatedFields: IAggregatedField[] = [];

            for (const [fieldName, stats] of Object.entries(fields)) {
                let aggregatedValue: number | string;

                const fieldSpec = summarySpecs.fields.find(
                    f => `${f.name}__${f.measure}` === fieldName
                );

                if (!fieldSpec) continue;

                switch (fieldSpec.measure) {
                    case XmlFieldMeasure.Sum:
                        aggregatedValue = stats.sum;
                        break;
                    case XmlFieldMeasure.Count:
                        aggregatedValue = stats.count;
                        break;
                    case XmlFieldMeasure.Min:
                        aggregatedValue = stats.min === Infinity ? "N/A" : stats.min;
                        break;
                    case XmlFieldMeasure.Max:
                        aggregatedValue = stats.max === -Infinity ? "N/A" : stats.max;
                        break;
                    case XmlFieldMeasure.Average:
                        aggregatedValue = stats.avg;
                        break;
                    case XmlFieldMeasure.StandardDeviation:
                        aggregatedValue = stats.stdDev;
                        break;
                    default:
                        aggregatedValue = "N/A";
                }

                aggregatedValue = formatAggregatedValue(aggregatedValue as number, fieldSpec, formatOptions);

                aggregatedFields.push({ name: fieldSpec.displayName, value: aggregatedValue });
            }

            summaryDictionary.set(group, aggregatedFields);
        }

        return formatOptions.asJson ? summaryDictionary.toJSON(true) : summaryDictionary;
    }

    /**
     * Processes an XML string using a separated summary spec and optional formatting config.
     *
     * @param xmlFile - The raw XML string to summarize.
     * @param summaryString - The summary definition string.
     * @param debug - Enables debug output (optional, default: false).
     * @param formatOptions - Optional formatting configuration.
     * @returns Summary output grouped by key or JSON string (based on formatting).
     */
    public static processXmlSummary(
        xmlFile: string,
        summaryString: string,
        debug: boolean = false,
        formatOptions: IXmlSummaryFormatOptions = {}
    ): SummaryDictionary | string {
        const summarySpecs = parseXmlSummary(summaryString);
        return XmlSummarizer.getSummaryFromXml(xmlFile, summarySpecs, debug, formatOptions);
    }

    /**
     * Extended XML summary processor that accepts a single string containing
     * both the summary specification and formatting options.
     *
     * @param xmlFile - The raw XML string to summarize.
     * @param combinedSpec - A string containing summary + formatting, separated by a delimiter.
     * @param debug - Enables debug output (optional, default: false).
     * @param delimiter - Delimiter to split summary and format sections (default: ";").
     * @returns Summary output grouped by key or JSON string.
     */
    public static processXmlSummaryEx(
        xmlFile: string,
        combinedSpec: string,
        debug: boolean = false,
        delimiter: string = ';'
    ): SummaryDictionary | string {
        const { xmlSummaryStr, formatingOpts } = parseSpecAndOptions(combinedSpec, delimiter);
        return XmlSummarizer.getSummaryFromXml(xmlFile, xmlSummaryStr, debug, formatingOpts);
    }

    
}
