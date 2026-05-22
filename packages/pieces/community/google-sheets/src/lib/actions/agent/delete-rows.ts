import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const deleteRows = createAction({
  auth: googleSheetsAuth,
  name: 'delete_rows_range',
  displayName: 'Delete Rows Range',
  description: 'Delete rows [startIndex, endIndex) from a sheet.',
  llmDescription:
    'spreadsheets.batchUpdate with deleteDimension dimension=ROWS. Destructive.',
  audience: 'agent',
  idempotent: false,
  sampleData: { replies: [{}] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID', required: true }),
    startIndex: Property.Number({ displayName: 'Start Row (0-based)', required: true }),
    endIndex: Property.Number({ displayName: 'End Row (0-based, exclusive)', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: propsValue.sheetId,
                dimension: 'ROWS',
                startIndex: propsValue.startIndex,
                endIndex: propsValue.endIndex,
              },
            },
          },
        ],
      },
    });
    return res.data;
  },
});
