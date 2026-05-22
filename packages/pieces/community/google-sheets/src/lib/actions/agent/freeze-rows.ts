import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const freezeRows = createAction({
  auth: googleSheetsAuth,
  name: 'freeze_rows',
  displayName: 'Freeze Rows',
  description: 'Freeze the top N rows of a sheet.',
  llmDescription:
    "spreadsheets.batchUpdate with updateSheetProperties{ gridProperties.frozenRowCount } — freeze the first N rows so they stay visible while scrolling. Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { replies: [{}] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID', required: true }),
    rowCount: Property.Number({ displayName: 'Rows To Freeze', required: true, defaultValue: 1 }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: propsValue.sheetId,
                gridProperties: { frozenRowCount: propsValue.rowCount },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });
    return res.data;
  },
});
