import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { clearSheetAction } from './lib/actions/clear-sheet';
import { deleteRowAction } from './lib/actions/delete-row.action';
import { findRowByNumAction } from './lib/actions/find-row-by-num';
import { findRowsAction } from './lib/actions/find-rows';
import { getRowsAction } from './lib/actions/get-rows';
import { insertRowAction } from './lib/actions/insert-row.action';
import { updateRowAction } from './lib/actions/update-row';
import {
	getAccessToken,
	googleSheetsAuth,
	GoogleSheetsAuthValue,
	googleSheetsCommon,
} from './lib/common/common';
import { newRowAddedTrigger } from './lib/triggers/new-row-added-webhook';
import { newOrUpdatedRowTrigger } from './lib/triggers/new-or-updated-row.trigger';
import { insertMultipleRowsAction } from './lib/actions/insert-multiple-rows.action';
import { createWorksheetAction } from './lib/actions/create-worksheet';
import { createSpreadsheetAction } from './lib/actions/create-spreadsheet';
import { findSpreadsheets } from './lib/actions/find-spreadsheets';
import { newSpreadsheetTrigger } from './lib/triggers/new-spreadsheet';
import { newWorksheetTrigger } from './lib/triggers/new-worksheet';
import { findWorksheetAction } from './lib/actions/find-worksheet';
import { copyWorksheetAction } from './lib/actions/copy-worksheet';
import { updateMultipleRowsAction } from './lib/actions/update-multiple-rows';
import { createColumnAction } from './lib/actions/create-column';
import { exportSheetAction } from './lib/actions/export-sheet';
import { getManyRowsAction } from './lib/actions/get-many-rows';
import { renameWorksheetAction } from './lib/actions/rename-worksheet';
import { deleteWorksheetAction } from './lib/actions/delete-worksheet';
import { formatRowAction } from './lib/actions/format-spreadsheet-row';

import { readRange } from './lib/actions/agent/read-range';
import { writeRange } from './lib/actions/agent/write-range';
import { clearRange } from './lib/actions/agent/clear-range';
import { appendValues } from './lib/actions/agent/append-values';
import { readCell } from './lib/actions/agent/read-cell';
import { writeCell } from './lib/actions/agent/write-cell';
import { readSheetAsJson } from './lib/actions/agent/read-sheet-as-json';
import { countRows } from './lib/actions/agent/count-rows';
import { getSpreadsheetMetadata } from './lib/actions/agent/get-spreadsheet-metadata';
import { sortRange } from './lib/actions/agent/sort-range';
import { duplicateSheet } from './lib/actions/agent/duplicate-sheet';
import { hideSheet } from './lib/actions/agent/hide-sheet';
import { addNamedRange } from './lib/actions/agent/add-named-range';
import { deleteNamedRange } from './lib/actions/agent/delete-named-range';
import { findRowByQuery } from './lib/actions/agent/find-row-by-query';
import { freezeRows } from './lib/actions/agent/freeze-rows';
import { autoResizeColumns } from './lib/actions/agent/auto-resize-columns';
import { listSheets } from './lib/actions/agent/list-sheets';
import { batchGetRanges } from './lib/actions/agent/batch-get-ranges';
import { batchUpdateValues } from './lib/actions/agent/batch-update-values';
import { insertEmptyRows } from './lib/actions/agent/insert-empty-rows';
import { deleteRows } from './lib/actions/agent/delete-rows';
import { protectRange } from './lib/actions/agent/protect-range';

export const googleSheets = createPiece({
	minimumSupportedRelease: '0.71.4',
	logoUrl: 'https://cdn.activepieces.com/pieces/google-sheets.png',
	categories: [PieceCategory.PRODUCTIVITY],
	authors: [
		'ShayPunter',
		'Ozak93',
		'Abdallah-Alwarawreh',
		'Salem-Alaa',
		'kishanprmr',
		'MoShizzle',
		'AbdulTheActivePiecer',
		'khaledmashaly',
		'abuaboud',
		'geekyme',
	],
	actions: [
		insertRowAction,
		insertMultipleRowsAction,
		updateRowAction,
		updateMultipleRowsAction,
		deleteRowAction,
		findRowsAction,
		createSpreadsheetAction,
		createWorksheetAction,
		clearSheetAction,
		deleteWorksheetAction,
		renameWorksheetAction,
		formatRowAction,
		findRowByNumAction,
		getRowsAction,
		getManyRowsAction,
		findSpreadsheets,
		findWorksheetAction,
		copyWorksheetAction,
		createColumnAction,
		exportSheetAction,
		createCustomApiCallAction({
			auth: googleSheetsAuth,
			baseUrl: () => {
				return googleSheetsCommon.baseUrl;
			},
			authMapping: async (auth) => {
				return {
					Authorization: `Bearer ${await getAccessToken(auth as GoogleSheetsAuthValue)}`,
				};
			},
		}),
		readRange,
		writeRange,
		clearRange,
		appendValues,
		readCell,
		writeCell,
		readSheetAsJson,
		countRows,
		getSpreadsheetMetadata,
		sortRange,
		duplicateSheet,
		hideSheet,
		addNamedRange,
		deleteNamedRange,
		findRowByQuery,
		freezeRows,
		autoResizeColumns,
		listSheets,
		batchGetRanges,
		batchUpdateValues,
		insertEmptyRows,
		deleteRows,
		protectRange,
	],
	displayName: 'Google Sheets',
	description: 'Create, edit, and collaborate on spreadsheets online',
	triggers: [
		newOrUpdatedRowTrigger,
		newRowAddedTrigger,
		newSpreadsheetTrigger,
		newWorksheetTrigger,
	],
	auth: googleSheetsAuth,
});
