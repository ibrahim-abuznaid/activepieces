import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from './agent-common';

export const batchUpdateValues = createAction({
  auth: googleSheetsAuth,
  name: 'batch_update_values',
  displayName: 'Batch Update Values',
  description: 'Write multiple ranges in one call.',
  llmDescription:
    "spreadsheets.values.batchUpdate — apply many range writes atomically. `data` is an array of { range, values }.",
  audience: 'agent',
  idempotent: true,
  sampleData: { totalUpdatedCells: 6 },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    data: Property.Json({ displayName: 'Updates [{range, values}]', required: true }),
    valueInputOption: Property.StaticDropdown({
      displayName: 'Value Input Option',
      required: false,
      defaultValue: 'USER_ENTERED',
      options: {
        disabled: false,
        options: ['USER_ENTERED', 'RAW'].map((v) => ({ label: v, value: v })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const res = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        valueInputOption: propsValue.valueInputOption ?? 'USER_ENTERED',
        data: propsValue.data as unknown as Array<{ range: string; values: unknown[][] }>,
      },
    });
    return res.data;
  },
});
