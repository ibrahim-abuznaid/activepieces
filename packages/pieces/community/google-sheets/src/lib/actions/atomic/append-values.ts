import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const appendValues = createAction({
  auth: googleSheetsAuth,
  name: 'append_values',
  displayName: 'Append Values',
  description: 'Append rows after the last row with data in a range.',
  llmDescription:
    "spreadsheets.values.append — append new rows. Google finds the table at `range` and writes after the last filled row. insertDataOption=INSERT_ROWS shifts existing rows below, OVERWRITE overwrites.",
  audience: 'agent',
  idempotent: false,
  sampleData: { spreadsheetId: 's1', updates: { updatedRows: 1, updatedRange: 'Sheet1!A5:B5' } },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    range: Property.ShortText({ displayName: 'A1 Range', required: true, defaultValue: 'Sheet1!A1' }),
    values: Property.Json({ displayName: 'Values (2D array)', required: true }),
    insertDataOption: Property.StaticDropdown({
      displayName: 'Insert Data Option',
      required: false,
      defaultValue: 'INSERT_ROWS',
      options: {
        disabled: false,
        options: ['INSERT_ROWS', 'OVERWRITE'].map((v) => ({ label: v, value: v })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: propsValue.insertDataOption ?? 'INSERT_ROWS',
      requestBody: { values: propsValue.values as unknown as unknown[][] },
    });
    return res.data;
  },
});
