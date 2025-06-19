import { IXmlSummary, IXmlSummaryField } from '../core/interfaces';
import { XmlSummaryOrientation, XmlFieldMeasure } from '../core/enums';

/**
 * Parses a summary specification string into a structured IXmlSummary object.
 *
 * Format: "targetNode,orientation,groupingField:groupingName,fieldName:displayName:measure,..."
 *
 * Example:
 *  "Item,1,Category:Group,Price:Total Price:1,Qty:Count:2"
 *
 * @param input - Compact summary spec string following the defined structure.
 * @returns Parsed IXmlSummary object.
 * @throws If the string is malformed or has an invalid measure/format.
 */
export function parseXmlSummary(input: string): IXmlSummary {
  const parts = input.split(',').map(p => p.trim());

  if (parts.length < 4) {
    throw new Error('Invalid summary format. Ensure correct structure.');
  }

  const targetNode = parts[0];
  const orientation = parseInt(parts[1], 10) as XmlSummaryOrientation;
  const [groupingField, groupingDisplayName] = parts[2].split(':').map(p => p.trim());

  const fields: IXmlSummaryField[] = parts.slice(3).map(part => {
    const [name, displayName, measureStr] = part.split(':').map(p => p.trim());

    if (!name || !displayName || measureStr === undefined) {
      throw new Error(`Invalid field definition: '${part}'. Must be 'name:displayName:measure'.`);
    }

    const measure = parseInt(measureStr, 10) as XmlFieldMeasure;

    if (isNaN(measure)) {
      throw new Error(`Invalid measure type for field '${name}'.`);
    }

    return { name, displayName, measure };
  });

  return { targetNode, orientation, groupingField, groupingDisplayName, fields };
}
