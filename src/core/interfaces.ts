import { XmlFieldMeasure, XmlSummaryOrientation } from "./enums";

export interface IXmlSummaryField {
    name: string;
    displayName: string;
    measure: XmlFieldMeasure;
}

export interface IXmlSummary {
    targetNode: string;
    orientation: XmlSummaryOrientation;
    groupingField?: string;
    groupingDisplayName?: string;
    fields: IXmlSummaryField[];
}

export interface IAggregatedField {
  name: string;
  value: number | string;
}

export interface IXmlSummaryFormatOptions {
  roundDecimals?: number;              // Decimal places to round numeric output
  currency?: string;                   // Currency code (e.g., "USD", "EUR")
  showCurrencySymbol?: boolean;        // Whether to prefix values with currency symbol
  asJson?: boolean;                    // Output as JSON string if true
  treatMissingAsZero?: boolean;        // Count missing numeric fields as zero (default true)
  percentageFields?: string[];         // Field displayNames to format as percentages
  integerFields?: string[];            // Field displayNames to format with no decimals
  sortResults?: boolean;               // Alphabetically sort fields in output group
}
