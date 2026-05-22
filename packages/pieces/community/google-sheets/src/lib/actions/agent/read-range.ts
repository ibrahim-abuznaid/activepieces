import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const readRange = createAction({
  auth: googleSheetsAuth,
  name: 'read_range',
  displayName: 'Read Range',
  description: 'Read raw cell values from an A1 range.',
  llmDescription:
    "spreadsheets.values.get — return values for an A1 range (e.g. 'Sheet1!A1:D20'). Returns 2D array of values. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { range: 'Sheet1!A1:B2', values: [['name', 'age'], ['alice', '30']] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    range: Property.ShortText({ displayName: 'A1 Range', required: true }),
    valueRenderOption: Property.StaticDropdown({
      displayName: 'Render Option',
      required: false,
      defaultValue: 'FORMATTED_VALUE',
      options: {
        disabled: false,
        options: ['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA'].map((v) => ({ label: v, value: v })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.range,
      valueRenderOption: propsValue.valueRenderOption ?? 'FORMATTED_VALUE',
    });
    return res.data;
  },
});
