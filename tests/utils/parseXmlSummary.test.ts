import { parseXmlSummary } from '../../src/utils/parseXmlSummary';
import { XmlSummaryOrientation, XmlFieldMeasure } from '../../src/core/enums';

describe('parseXmlSummary', () => {
  it('parses a valid summary string correctly', () => {
    const result = parseXmlSummary(
      'Item,1,Category:Group,Price:Total Price:1,Qty:Count:2'
    );

    expect(result.targetNode).toBe('Item');
    expect(result.orientation).toBe(XmlSummaryOrientation.Horizontal);
    expect(result.groupingField).toBe('Category');
    expect(result.groupingDisplayName).toBe('Group');
    expect(result.fields.length).toBe(2);
    expect(result.fields[0]).toEqual({
      name: 'Price',
      displayName: 'Total Price',
      measure: XmlFieldMeasure.Sum,
    });
    expect(result.fields[1].measure).toBe(XmlFieldMeasure.Count);
  });

  it('throws on too few segments', () => {
    expect(() => parseXmlSummary('TooFew,0,Field')).toThrow(
      /Invalid summary format/i
    );
  });

  it('throws on missing field measure', () => {
    expect(() =>
      parseXmlSummary('Node,0,Group:Totals,Amount:Total')
    ).toThrow(/Invalid field definition/i);
  });

  it('throws on non-numeric measure type', () => {
    expect(() =>
      parseXmlSummary('Node,1,Group:Totals,Amount:Total:x')
    ).toThrow(/Invalid measure type/i);
  });

  it('trims extra whitespace gracefully', () => {
    const parsed = parseXmlSummary(
      ' Item , 2 , Dept : Totals , Price : Price USD : 1 '
    );
    expect(parsed.targetNode).toBe('Item');
    expect(parsed.orientation).toBe(XmlSummaryOrientation.Vertical);
    expect(parsed.groupingField).toBe('Dept');
    expect(parsed.groupingDisplayName).toBe('Totals');
    expect(parsed.fields[0].displayName).toBe('Price USD');
  });
});
