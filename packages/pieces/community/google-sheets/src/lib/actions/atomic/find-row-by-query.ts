import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const findRowByQuery = createAction({
  auth: googleSheetsAuth,
  name: 'find_row_by_query',
  displayName: 'Find Row By Column Value',
  description: 'Find the first row where a named column equals a value.',
  llmDescription:
    "Reads the sheet (values.get), uses headerRow as the column index, and returns the first row where the named column equals `value` (string equality). Returns { rowNumber, row } or { found: false }. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { found: true, rowNumber: 5, row: { id: '42', name: 'Alice' } },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetName: Property.ShortText({ displayName: 'Sheet Name', required: true }),
    columnName: Property.ShortText({ displayName: 'Column Header', required: true }),
    value: Property.ShortText({ displayName: 'Value', required: true }),
    headerRow: Property.Number({ displayName: 'Header Row (1-based)', required: false, defaultValue: 1 }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.sheetName,
    });
    const all = res.data.values ?? [];
    const headerIdx = (propsValue.headerRow ?? 1) - 1;
    const headers = (all[headerIdx] ?? []).map(String);
    const colIdx = headers.indexOf(propsValue.columnName);
    if (colIdx < 0) return { found: false, reason: 'column not found' };
    for (let i = headerIdx + 1; i < all.length; i++) {
      if (String(all[i][colIdx] ?? '') === propsValue.value) {
        const row = headers.reduce<Record<string, string>>((acc, h, j) => {
          acc[h] = String(all[i][j] ?? '');
          return acc;
        }, {});
        return { found: true, rowNumber: i + 1, row };
      }
    }
    return { found: false };
  },
});
