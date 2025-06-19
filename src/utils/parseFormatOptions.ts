import type { IXmlSummaryFormatOptions } from '../core/interfaces';

/**
 * Parses a compact key-value configuration string into IXmlSummaryFormatOptions.
 *
 * Format: "rd=2,cu=USD,sc=1,tm=0,pf=Avg%|Rate%,if=Qty|Count"
 *
 * Keys:
 *  - rd: roundDecimals
 *  - cu: currency
 *  - sc: showCurrencySymbol (1=true, 0=false)
 *  - tm: treatMissingAsZero
 *  - pf: percentageFields
 *  - if: integerFields
 *
 * @param input - Formatted string with short two-letter keys.
 * @returns Parsed IXmlSummaryFormatOptions object.
 */
export function parseFormatOptionsShort(input: string): IXmlSummaryFormatOptions {
  const options: IXmlSummaryFormatOptions = {};

  input.split(',').forEach(part => {
    const [rawKey, rawValue] = part.split('=').map(p => p.trim());

    if (!rawKey || rawValue === undefined) return;

    switch (rawKey) {
      case 'rd':
        options.roundDecimals = parseInt(rawValue, 10);
        break;
      case 'cu':
        options.currency = rawValue;
        break;
      case 'sc':
        options.showCurrencySymbol = rawValue === '1';
        break;
      case 'as':
        options.asJson = rawValue === '1';
        break;
      case 'tm':
        options.treatMissingAsZero = rawValue === '1';
        break;
      case 'sr':
        options.sortResults = rawValue === '1';
        break;
      case 'pf':
        options.percentageFields = rawValue.split('|').map(p => p.trim());
        break;
      case 'if':
        options.integerFields = rawValue.split('|').map(p => p.trim());
        break;
    }
  });

  return options;
}
