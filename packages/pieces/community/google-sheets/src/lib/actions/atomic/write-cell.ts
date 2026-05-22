import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const writeCell = createAction({
  auth: googleSheetsAuth,
  name: 'write_cell',
  displayName: 'Write Cell',
  description: 'Write a single cell value by A1 address.',
  llmDescription:
    "spreadsheets.values.update for a single cell with USER_ENTERED parsing (formulas allowed). Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { updatedRange: 'Sheet1!B5', updatedCells: 1 },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    cell: Property.ShortText({ displayName: 'Cell (e.g. Sheet1!B5)', required: true }),
    value: Property.ShortText({ displayName: 'Value', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.cell,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[propsValue.value]] },
    });
    return res.data;
  },
});
