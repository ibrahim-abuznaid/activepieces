import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const hideSheet = createAction({
  auth: googleSheetsAuth,
  name: 'hide_sheet',
  displayName: 'Hide / Unhide Sheet',
  description: 'Hide or unhide a sheet within a spreadsheet.',
  llmDescription:
    "spreadsheets.batchUpdate with updateSheetProperties{ hidden } — toggle the hidden flag. Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { replies: [{}] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID', required: true }),
    hidden: Property.Checkbox({ displayName: 'Hidden', required: true, defaultValue: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId: propsValue.sheetId, hidden: propsValue.hidden },
              fields: 'hidden',
            },
          },
        ],
      },
    });
    return res.data;
  },
});
