import { parseSpecAndOptions } from './parseSpecAndOptions';
import { XmlFieldMeasure, XmlSummaryOrientation } from '../core/enums';

describe('parseSpecAndOptions', () => {
  it('parses combined string into summary and format objects', () => {
    const input = 'Item,2,Dept:Total,Price:Total Price:1;rd=2,cu=USD,sc=1,tm=1';

    const { xmlSummaryStr, formatingOpts } = parseSpecAndOptions(input);

    expect(xmlSummaryStr.targetNode).toBe('Item');
    expect(xmlSummaryStr.orientation).toBe(XmlSummaryOrientation.Vertical);
    expect(xmlSummaryStr.groupingField).toBe('Dept');
    expect(xmlSummaryStr.fields[0]).toEqual({
      name: 'Price',
      displayName: 'Total Price',
      measure: XmlFieldMeasure.Sum
    });

    expect(formatingOpts.roundDecimals).toBe(2);
    expect(formatingOpts.currency).toBe('USD');
    expect(formatingOpts.showCurrencySymbol).toBe(true);
    expect(formatingOpts.treatMissingAsZero).toBe(true);
  });

  it('throws on missing delimiter or malformed string', () => {
    expect(() =>
      parseSpecAndOptions('Incomplete,1,Cat:Group,Value:Total:1')
    ).toThrow(/Invalid input format/i);
  });

  it('parses multiple fields and complex formatting', () => {
    const input = 'Sale,1,Type:Group,Price:Total:1,Qty:Count:2;rd=1,sc=0,pf=Avg%|Rate%,if=Qty';
    const result = parseSpecAndOptions(input);

    expect(result.xmlSummaryStr.fields.length).toBe(2);
    expect(result.formatingOpts.roundDecimals).toBe(1);
    expect(result.formatingOpts.showCurrencySymbol).toBe(false);
    expect(result.formatingOpts.percentageFields).toContain('Avg%');
    expect(result.formatingOpts.integerFields).toContain('Qty');
  });
});
