import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const clearRange = createAction({
  auth: googleSheetsAuth,
  name: 'clear_range',
  displayName: 'Clear Range',
  description: 'Clear all values in an A1 range.',
  llmDescription:
    'spreadsheets.values.clear — empties values in the range without affecting formatting. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { spreadsheetId: 's1', clearedRange: 'Sheet1!A1:Z1000' },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    range: Property.ShortText({ displayName: 'A1 Range', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.clear({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.range,
    });
    return res.data;
  },
});
