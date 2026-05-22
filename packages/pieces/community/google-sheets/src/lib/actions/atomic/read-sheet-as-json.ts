import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const readSheetAsJson = createAction({
  auth: googleSheetsAuth,
  name: 'read_sheet_as_json',
  displayName: 'Read Sheet As JSON',
  description: 'Read a sheet and return rows as an array of objects keyed by header row.',
  llmDescription:
    "spreadsheets.values.get on the full sheet, then maps headerRow → each row to produce typed objects. Good shape for LLM consumption of tabular data. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { rows: [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetName: Property.ShortText({ displayName: 'Sheet Name', required: true }),
    headerRow: Property.Number({ displayName: 'Header Row (1-indexed)', required: false, defaultValue: 1 }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.sheetName,
    });
    const all = res.data.values ?? [];
    const headerIdx = (propsValue.headerRow ?? 1) - 1;
    const headers = (all[headerIdx] ?? []).map((h) => String(h));
    const rows = all.slice(headerIdx + 1).map((row) =>
      headers.reduce<Record<string, string>>((acc, h, i) => {
        acc[h] = String(row[i] ?? '');
        return acc;
      }, {}),
    );
    return { rows };
  },
});
