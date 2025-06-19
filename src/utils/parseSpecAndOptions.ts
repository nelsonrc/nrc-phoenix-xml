import { IXmlSummary } from '../core/interfaces';
import { IXmlSummaryFormatOptions } from '../core/interfaces';
import { parseXmlSummary } from './parseXmlSummary';
import { parseFormatOptions } from './parseFormatOptions';

/**
 * Parses a dual-purpose string containing both summary spec and formatting config,
 * separated by a defined delimiter (default: ";").
 *
 * Example:
 *  "Item,2,Dept:Totals,Price:Price:1;rd=2,sc=1,tm=0"
 *
 * @param input - Combined summary and formatting string.
 * @param delimiter - Optional separator between summary and format sections (default: ";").
 * @returns An object containing:
 *  - xmlSummaryStr: IXmlSummary
 *  - formatingOpts: IXmlSummaryFormatOptions
 * @throws If the input is missing one of the two required segments.
 */
export function parseSpecAndOptions(
  input: string,
  delimiter = ';'
): {
  xmlSummaryStr: IXmlSummary;
  formatingOpts: IXmlSummaryFormatOptions;
} {
  const [summaryPart, formatPart] = input.split(delimiter).map(p => p.trim());

  if (!summaryPart || !formatPart) {
    throw new Error(`Invalid input format. Expected 'summary${delimiter}options'.`);
  }

  const xmlSummaryStr = parseXmlSummary(summaryPart);
  const formatingOpts = parseFormatOptions(formatPart);

  return { xmlSummaryStr, formatingOpts };
}
