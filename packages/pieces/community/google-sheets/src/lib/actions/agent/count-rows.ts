import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const countRows = createAction({
  auth: googleSheetsAuth,
  name: 'count_rows',
  displayName: 'Count Rows',
  description: 'Return the number of rows with data in a sheet.',
  llmDescription:
    "spreadsheets.values.get for the full sheet → count non-empty rows. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { rows: 42 },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetName: Property.ShortText({ displayName: 'Sheet Name', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.sheetName,
    });
    return { rows: (res.data.values ?? []).filter((r) => r.length > 0).length };
  },
});
