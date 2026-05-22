import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const autoResizeColumns = createAction({
  auth: googleSheetsAuth,
  name: 'auto_resize_columns',
  displayName: 'Auto-Resize Columns',
  description: 'Auto-resize a column range to fit content.',
  llmDescription:
    "spreadsheets.batchUpdate with autoResizeDimensions — fit columns [startColumn,endColumn) on sheetId. Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { replies: [{}] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID', required: true }),
    startColumn: Property.Number({ displayName: 'Start Column (0-based)', required: true, defaultValue: 0 }),
    endColumn: Property.Number({ displayName: 'End Column (0-based, exclusive)', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: propsValue.sheetId,
                dimension: 'COLUMNS',
                startIndex: propsValue.startColumn,
                endIndex: propsValue.endColumn,
              },
            },
          },
        ],
      },
    });
    return res.data;
  },
});
