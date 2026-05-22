import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const addNamedRange = createAction({
  auth: googleSheetsAuth,
  name: 'add_named_range',
  displayName: 'Add Named Range',
  description: 'Define a named range in a spreadsheet.',
  llmDescription:
    "spreadsheets.batchUpdate with addNamedRange — create a named range covering [startRow,endRow) x [startColumn,endColumn) on sheetId.",
  audience: 'agent',
  idempotent: false,
  sampleData: { replies: [{ addNamedRange: { namedRange: { namedRangeId: 'nr-1' } } }] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    name: Property.ShortText({ displayName: 'Name', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID', required: true }),
    startRow: Property.Number({ displayName: 'Start Row (0-based)', required: true }),
    endRow: Property.Number({ displayName: 'End Row (0-based, exclusive)', required: true }),
    startColumn: Property.Number({ displayName: 'Start Column (0-based)', required: true }),
    endColumn: Property.Number({ displayName: 'End Column (0-based, exclusive)', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            addNamedRange: {
              namedRange: {
                name: propsValue.name,
                range: {
                  sheetId: propsValue.sheetId,
                  startRowIndex: propsValue.startRow,
                  endRowIndex: propsValue.endRow,
                  startColumnIndex: propsValue.startColumn,
                  endColumnIndex: propsValue.endColumn,
                },
              },
            },
          },
        ],
      },
    });
    return res.data;
  },
});
