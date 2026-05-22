import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const duplicateSheet = createAction({
  auth: googleSheetsAuth,
  name: 'duplicate_sheet',
  displayName: 'Duplicate Sheet',
  description: 'Duplicate an existing sheet within the same spreadsheet.',
  llmDescription:
    'spreadsheets.batchUpdate with duplicateSheet — clone a sheet (formula references update appropriately). Returns the new sheet metadata.',
  audience: 'agent',
  idempotent: false,
  sampleData: { replies: [{ duplicateSheet: { properties: { sheetId: 999, title: 'Sheet1 Copy' } } }] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sourceSheetId: Property.Number({ displayName: 'Source Sheet ID', required: true }),
    newSheetName: Property.ShortText({ displayName: 'New Sheet Name', required: false }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            duplicateSheet: {
              sourceSheetId: propsValue.sourceSheetId,
              newSheetName: propsValue.newSheetName,
            },
          },
        ],
      },
    });
    return res.data;
  },
});
