import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const writeRange = createAction({
  auth: googleSheetsAuth,
  name: 'write_range',
  displayName: 'Write Range',
  description: 'Write a 2D array of values to an A1 range.',
  llmDescription:
    "spreadsheets.values.update — overwrite cell values for an A1 range. Pass values as a 2D array (rows of cells). valueInputOption=USER_ENTERED treats strings starting with = as formulas; RAW treats them as text. Idempotent (same input → same end state).",
  audience: 'agent',
  idempotent: true,
  sampleData: { spreadsheetId: 's1', updatedRange: 'Sheet1!A1:B2', updatedRows: 2 },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    range: Property.ShortText({ displayName: 'A1 Range', required: true }),
    values: Property.Json({ displayName: 'Values (2D array)', required: true }),
    valueInputOption: Property.StaticDropdown({
      displayName: 'Value Input Option',
      required: false,
      defaultValue: 'USER_ENTERED',
      options: {
        disabled: false,
        options: ['USER_ENTERED', 'RAW'].map((v) => ({ label: v, value: v })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.range,
      valueInputOption: propsValue.valueInputOption ?? 'USER_ENTERED',
      requestBody: { values: propsValue.values as unknown as unknown[][] },
    });
    return res.data;
  },
});
