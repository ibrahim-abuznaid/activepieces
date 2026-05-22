import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const insertEmptyRows = createAction({
  auth: googleSheetsAuth,
  name: 'insert_empty_rows',
  displayName: 'Insert Empty Rows',
  description: 'Insert N empty rows at the given index.',
  llmDescription:
    'spreadsheets.batchUpdate with insertDimension dimension=ROWS — push existing rows down to make room.',
  audience: 'agent',
  idempotent: false,
  sampleData: { replies: [{}] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID', required: true }),
    startIndex: Property.Number({ displayName: 'Start Row Index (0-based)', required: true }),
    count: Property.Number({ displayName: 'Rows to Insert', required: true, defaultValue: 1 }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: propsValue.sheetId,
                dimension: 'ROWS',
                startIndex: propsValue.startIndex,
                endIndex: propsValue.startIndex + propsValue.count,
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });
    return res.data;
  },
});
