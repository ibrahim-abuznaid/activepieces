import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsAuth } from '../../common/common';
import { sheetsAgentCommon } from '../atomic/agent-common';

export const buildReportSheet = createAction({
  auth: googleSheetsAuth,
  name: 'build_report_sheet',
  displayName: 'Build Report Sheet',
  description:
    'Composite: write headers + data + freeze top row + auto-resize columns in one canvas action.',
  llmDescription:
    'Canvas-facing composite. Chains atomic Sheets API calls: values.update (header row + data) → batchUpdate updateSheetProperties (freezeRowCount=1) → batchUpdate autoResizeDimensions.',
  audience: 'canvas',
  idempotent: true,
  sampleData: { spreadsheetId: 's1', updatedRange: 'Sheet1!A1:D10' },
  props: {
    spreadsheetId: Property.ShortText({ displayName: 'Spreadsheet ID', required: true }),
    sheetName: Property.ShortText({ displayName: 'Sheet Name', required: true, defaultValue: 'Sheet1' }),
    sheetId: Property.Number({ displayName: 'Sheet ID (numeric)', required: true, defaultValue: 0 }),
    headers: Property.Array({ displayName: 'Headers (row 1)', required: true }),
    rows: Property.Json({ displayName: 'Data Rows (2D array)', required: true }),
  },
  async run({ auth, propsValue }) {
    const sheets = await sheetsAgentCommon.sheetsClient(auth);
    const headers = (propsValue.headers as string[]).map(String);
    const dataRows = (propsValue.rows as unknown as unknown[][]) ?? [];
    const values = [headers, ...dataRows];

    const updateRes = await sheets.spreadsheets.values.update({
      spreadsheetId: propsValue.spreadsheetId,
      range: propsValue.sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: propsValue.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId: propsValue.sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: propsValue.sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headers.length,
              },
            },
          },
        ],
      },
    });
    return updateRes.data;
  },
});
