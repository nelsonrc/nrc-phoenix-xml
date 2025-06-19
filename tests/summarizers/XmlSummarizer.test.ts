import { XmlSummarizer } from '../../src/summarizers/XmlSummarizer';
import { XmlFieldMeasure, XmlSummaryOrientation } from '../../src/core/enums';
import { IXmlSummary } from '../../src/core/interfaces';
import { Dictionary } from '../../src/core/Dictionary';

describe('XmlSummarizer', () => {
  const xml = `
    <Root>
      <Item>
        <Category>A</Category>
        <Price>100</Price>
        <Quantity>2</Quantity>
      </Item>
      <Item>
        <Category>B</Category>
        <Price>150</Price>
        <Quantity>3</Quantity>
      </Item>
      <Item>
        <Category>A</Category>
        <Price>200</Price>
        <Quantity>1</Quantity>
      </Item>
    </Root>
  `;

  const summaryConfig: IXmlSummary = {
    targetNode: 'Item',
    orientation: XmlSummaryOrientation.Vertical,
    groupingField: 'Category',
    groupingDisplayName: 'Grouped',
    fields: [
      { name: 'Price', displayName: 'Total Price', measure: XmlFieldMeasure.Sum },
      { name: 'Quantity', displayName: 'Count', measure: XmlFieldMeasure.Count },
      { name: 'Price', displayName: 'Min Price', measure: XmlFieldMeasure.Min },
      { name: 'Price', displayName: 'Avg Price', measure: XmlFieldMeasure.Average }
    ]
  };
  
  it('should return summary as a Dictionary', () => {
    const result = XmlSummarizer.getSummaryFromXml(xml, summaryConfig);
    expect(typeof result).toBe('object');
    expect(result).toBeInstanceOf(Dictionary);

    const groupA = (result as Dictionary<string, any>).get('A');
    expect(groupA).toBeDefined();
    expect(groupA?.some((f: any) => f.name === 'Total Price')).toBe(true);
  });

  it('should format result as JSON when requested', () => {
    const result = XmlSummarizer.getSummaryFromXml(xml, summaryConfig, false, {
      asJson: true
    });

    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result as string);
    expect(parsed['A']).toBeDefined();
    expect(Array.isArray(parsed['A'])).toBe(true);
  });

  it('should apply rounding correctly', () => {
    const result = XmlSummarizer.getSummaryFromXml(xml, summaryConfig, false, {
      roundDecimals: 1,
      asJson: true
    });

    const parsed = JSON.parse(result as string);
    const avgField = parsed['A'].find((f: any) => f.name === 'Avg Price');

    expect(avgField?.value).toBeDefined();
    expect(typeof avgField.value === 'string' || typeof avgField.value === 'number').toBe(true);
    expect(avgField.value.toString()).toMatch(/^\d+(\.\d)?$/);
  });

it('should group all results under "Totals" when groupingField is "*"', () => {
  const xml = `
    <Root>
      <Item>
        <Price>50</Price>
        <Price>100</Price>
        <Price>150</Price>
      </Item>
      <Item>
        <Price>200</Price>
      </Item>
    </Root>
  `;

  const summaryConfig: IXmlSummary = {
    targetNode: 'Item',
    orientation: XmlSummaryOrientation.Vertical,
    groupingField: '*',
    groupingDisplayName: 'Totals',
    fields: [
      { name: 'Price', displayName: 'Total Price', measure: XmlFieldMeasure.Sum },
      { name: 'Price', displayName: 'Avg Price', measure: XmlFieldMeasure.Average }
    ]
  };

  const result = XmlSummarizer.getSummaryFromXml(xml, summaryConfig, false, {
    asJson: true,
    roundDecimals: 2,
    treatMissingAsZero: true,
  });

  const parsed = JSON.parse(result as string);

  console.log(parsed);

  const group = parsed['Totals'];
  expect(group).toBeDefined();
  expect(Array.isArray(group)).toBe(true);

  const sum = group.find((f: any) => f.name === 'Total Price');
  const avg = group.find((f: any) => f.name === 'Avg Price');

  expect(sum?.value).toBeDefined();
  expect(avg?.value).toBeDefined();
});

});
