import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const listSheets = createAction({
  auth: googleSheetsAuth,
  name: 'list_sheets',
  displayName: 'List Sheets In Spreadsheet',
  description: 'List the sheets (tabs) in a spreadsheet.',
  llmDescription:
    "spreadsheets.get fields=sheets.properties — returns sheetId + title + gridProperties for each tab. Use to resolve a sheet name to its numeric sheetId. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { sheets: [{ properties: { sheetId: 0, title: 'Sheet1', index: 0 } }] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.get({
      spreadsheetId: propsValue.spreadsheetId,
      fields: 'sheets.properties',
    });
    return { sheets: res.data.sheets ?? [] };
  },
});
