import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const deleteNamedRange = createAction({
  auth: googleSheetsAuth,
  name: 'delete_named_range',
  displayName: 'Delete Named Range',
  description: 'Remove a named range by id.',
  llmDescription:
    'spreadsheets.batchUpdate with deleteNamedRange — remove a named range. List existing ones via get_spreadsheet_metadata first.',
  audience: 'agent',
  idempotent: true,
  sampleData: { replies: [{}] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    namedRangeId: Property.ShortText({ displayName: 'Named Range ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: { requests: [{ deleteNamedRange: { namedRangeId: propsValue.namedRangeId } }] },
    });
    return res.data;
  },
});
