import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const batchGetRanges = createAction({
  auth: googleSheetsAuth,
  name: 'batch_get_ranges',
  displayName: 'Batch Read Ranges',
  description: 'Read multiple A1 ranges in one call.',
  llmDescription:
    "spreadsheets.values.batchGet — fetch many ranges in one request. Saves round-trips when an agent needs several non-contiguous sections. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { valueRanges: [{ range: 'Sheet1!A1:B2', values: [['a', 'b']] }] },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    ranges: Property.Array({ displayName: 'Ranges', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: propsValue.spreadsheetId,
      ranges: propsValue.ranges as string[],
    });
    return res.data;
  },
});
