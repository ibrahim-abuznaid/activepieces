import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const sortRange = createAction({
  auth: googleSheetsAuth,
  name: 'sort_range',
  displayName: 'Sort Range',
  description: 'Sort a range by a single column.',
  llmDescription:
    "spreadsheets.batchUpdate with sortRange — sort the range by `sortByColumnIndex` (0-based) ascending or descending.",
  audience: 'agent',
  idempotent: true,
  sampleData: { spreadsheetId: 's1', replies: [{}] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID (numeric)', required: true }),
    startRow: Property.Number({ displayName: 'Start Row (0-based)', required: true, defaultValue: 1 }),
    endRow: Property.Number({ displayName: 'End Row (0-based, exclusive)', required: true }),
    startColumn: Property.Number({ displayName: 'Start Column (0-based)', required: true, defaultValue: 0 }),
    endColumn: Property.Number({ displayName: 'End Column (0-based, exclusive)', required: true }),
    sortByColumnIndex: Property.Number({ displayName: 'Sort By Column Index (0-based)', required: true }),
    descending: Property.Checkbox({ displayName: 'Descending', required: false, defaultValue: false }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: propsValue.sheetId,
                startRowIndex: propsValue.startRow,
                endRowIndex: propsValue.endRow,
                startColumnIndex: propsValue.startColumn,
                endColumnIndex: propsValue.endColumn,
              },
              sortSpecs: [
                {
                  dimensionIndex: propsValue.sortByColumnIndex,
                  sortOrder: propsValue.descending ? 'DESCENDING' : 'ASCENDING',
                },
              ],
            },
          },
        ],
      },
    });
    return res.data;
  },
});
