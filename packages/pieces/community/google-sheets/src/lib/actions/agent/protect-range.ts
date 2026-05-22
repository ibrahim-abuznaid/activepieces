import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const protectRange = createAction({
  auth: googleSheetsAuth,
  name: 'protect_range',
  displayName: 'Protect Range',
  description: 'Mark a range read-only with a description.',
  llmDescription:
    'spreadsheets.batchUpdate with addProtectedRange — protect a range so only specific users can edit it. With requestingUserCanEdit=true the bot retains edit access.',
  audience: 'agent',
  idempotent: false,
  sampleData: { replies: [{ addProtectedRange: { protectedRange: { protectedRangeId: 1 } } }] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetId: Property.Number({ displayName: 'Sheet ID', required: true }),
    startRow: Property.Number({ displayName: 'Start Row (0-based)', required: true }),
    endRow: Property.Number({ displayName: 'End Row (0-based, exclusive)', required: true }),
    startColumn: Property.Number({ displayName: 'Start Column (0-based)', required: true }),
    endColumn: Property.Number({ displayName: 'End Column (0-based, exclusive)', required: true }),
    description: Property.ShortText({ displayName: 'Description', required: false, defaultValue: 'Protected by agent' }),
    warningOnly: Property.Checkbox({ displayName: 'Warning Only', required: false, defaultValue: false }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            addProtectedRange: {
              protectedRange: {
                range: {
                  sheetId: propsValue.sheetId,
                  startRowIndex: propsValue.startRow,
                  endRowIndex: propsValue.endRow,
                  startColumnIndex: propsValue.startColumn,
                  endColumnIndex: propsValue.endColumn,
                },
                description: propsValue.description ?? 'Protected by agent',
                warningOnly: propsValue.warningOnly ?? false,
                requestingUserCanEdit: true,
              },
            },
          },
        ],
      },
    });
    return res.data;
  },
});
