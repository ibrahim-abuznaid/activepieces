import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const readCell = createAction({
  auth: googleSheetsAuth,
  name: 'read_cell',
  displayName: 'Read Cell',
  description: 'Read a single cell value by A1 address.',
  llmDescription:
    "spreadsheets.values.get for a single cell (e.g. 'Sheet1!B5'). Returns the value as a string. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { value: 'Alice' },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    cell: Property.ShortText({ displayName: 'Cell (e.g. Sheet1!B5)', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.cell,
    });
    return { value: res.data.values?.[0]?.[0] ?? null };
  },
});
