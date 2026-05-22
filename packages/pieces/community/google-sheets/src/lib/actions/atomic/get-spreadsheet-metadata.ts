import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const getSpreadsheetMetadata = createAction({
  auth: googleSheetsAuth,
  name: 'get_spreadsheet_metadata',
  displayName: 'Get Spreadsheet Metadata',
  description: 'Return spreadsheet title, sheets list, and named ranges.',
  llmDescription:
    "spreadsheets.get fields=properties,sheets.properties,namedRanges — useful before any operation to discover sheet names/ids and named ranges. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { properties: { title: 'My Doc' }, sheets: [{ properties: { sheetId: 0, title: 'Sheet1' } }] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.get({
      spreadsheetId: propsValue.spreadsheetId,
      fields: 'properties,sheets.properties,namedRanges',
    });
    return res.data;
  },
});
