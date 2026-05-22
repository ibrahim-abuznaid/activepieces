import { createAction, Property } from '@activepieces/pieces-framework';
import { docs_v1 } from 'googleapis';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

const hexToRgb = (hex: string): { red: number; green: number; blue: number } | undefined => {
  const m = /^#?([a-fA-F0-9]{6})$/.exec(hex);
  if (!m) return undefined;
  const num = parseInt(m[1], 16);
  return { red: ((num >> 16) & 255) / 255, green: ((num >> 8) & 255) / 255, blue: (num & 255) / 255 };
};

export const formatTextRange = createAction({
  auth: googleDocsAuth,
  name: 'format_text_range',
  displayName: 'Format Text Range',
  description: 'Apply text formatting (bold, italic, underline, font, color) to a range.',
  llmDescription:
    'Apply textStyle to a character range via batchUpdate updateTextStyle. Only fields you pass are touched (uses the fields mask). Pass startIndex+endIndex from read_document. Pass colorHex as #RRGGBB.',
  audience: 'agent',
  idempotent: true,
  sampleData: { documentId: '1A2bC3', replies: [{}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    startIndex: Property.Number({ displayName: 'Start Index', required: true }),
    endIndex: Property.Number({ displayName: 'End Index (exclusive)', required: true }),
    bold: Property.Checkbox({ displayName: 'Bold', required: false }),
    italic: Property.Checkbox({ displayName: 'Italic', required: false }),
    underline: Property.Checkbox({ displayName: 'Underline', required: false }),
    strikethrough: Property.Checkbox({ displayName: 'Strikethrough', required: false }),
    fontFamily: Property.ShortText({ displayName: 'Font Family', required: false }),
    fontSizePt: Property.Number({ displayName: 'Font Size (pt)', required: false }),
    colorHex: Property.ShortText({ displayName: 'Color (#RRGGBB)', required: false }),
  },
  async run({ auth, propsValue }) {
    const textStyle: docs_v1.Schema$TextStyle = {};
    const fieldsList: string[] = [];
    if (propsValue.bold !== undefined) { textStyle.bold = propsValue.bold; fieldsList.push('bold'); }
    if (propsValue.italic !== undefined) { textStyle.italic = propsValue.italic; fieldsList.push('italic'); }
    if (propsValue.underline !== undefined) { textStyle.underline = propsValue.underline; fieldsList.push('underline'); }
    if (propsValue.strikethrough !== undefined) { textStyle.strikethrough = propsValue.strikethrough; fieldsList.push('strikethrough'); }
    if (propsValue.fontFamily) {
      textStyle.weightedFontFamily = { fontFamily: propsValue.fontFamily, weight: 400 };
      fieldsList.push('weightedFontFamily');
    }
    if (propsValue.fontSizePt) {
      textStyle.fontSize = { magnitude: propsValue.fontSizePt, unit: 'PT' };
      fieldsList.push('fontSize');
    }
    if (propsValue.colorHex) {
      const rgb = hexToRgb(propsValue.colorHex);
      if (rgb) {
        textStyle.foregroundColor = { color: { rgbColor: rgb } };
        fieldsList.push('foregroundColor');
      }
    }
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [
        {
          updateTextStyle: {
            range: { startIndex: propsValue.startIndex, endIndex: propsValue.endIndex },
            textStyle,
            fields: fieldsList.join(','),
          },
        },
      ],
    });
  },
});
