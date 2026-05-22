import { createPiece } from '@activepieces/pieces-framework';

import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { PieceCategory } from '@activepieces/shared';
import { createDocument } from './lib/actions/create-document';
import { createDocumentBasedOnTemplate } from './lib/actions/create-document-based-on-template.action';
import { readDocument } from './lib/actions/read-document.action';
import { appendText } from './lib/actions/append-text';
import { findDocumentAction } from './lib/actions/find-document';
import { newDocumentTrigger } from './lib/triggers/new-document';
import { googleDocsAuth, getAccessToken, GoogleDocsAuthValue } from './lib/auth';

import { readDocumentText } from './lib/actions/agent/read-document-text';
import { listRecentDocuments } from './lib/actions/agent/list-recent-documents';
import { getDocumentOutline } from './lib/actions/agent/get-document-outline';
import { searchDocuments } from './lib/actions/agent/search-documents';
import { countWords } from './lib/actions/agent/count-words';
import { copyDocument } from './lib/actions/agent/copy-document';
import { deleteDocument } from './lib/actions/agent/delete-document';
import { renameDocument } from './lib/actions/agent/rename-document';
import { insertTextAtIndex } from './lib/actions/agent/insert-text-at-index';
import { insertTextAtEnd } from './lib/actions/agent/insert-text-at-end';
import { insertHeading } from './lib/actions/agent/insert-heading';
import { replaceText } from './lib/actions/agent/replace-text';
import { deleteTextRange } from './lib/actions/agent/delete-text-range';
import { formatTextRange } from './lib/actions/agent/format-text-range';
import { insertPageBreak } from './lib/actions/agent/insert-page-break';
import { insertSectionBreak } from './lib/actions/agent/insert-section-break';
import { insertTable } from './lib/actions/agent/insert-table';
import { createBulletedList } from './lib/actions/agent/create-bulleted-list';
import { createNumberedList } from './lib/actions/agent/create-numbered-list';
import { shareDocument } from './lib/actions/agent/share-document';
import { getShareLink } from './lib/actions/agent/get-share-link';
import { setAnyoneWithLink } from './lib/actions/agent/set-anyone-with-link';

export { googleDocsAuth, getAccessToken, GoogleDocsAuthValue } from './lib/auth';

export const googleDocs = createPiece({
	displayName: 'Google Docs',
	description: 'Create and edit documents online',
	minimumSupportedRelease: '0.30.0',
	logoUrl: 'https://cdn.activepieces.com/pieces/google-docs.png',
	categories: [PieceCategory.CONTENT_AND_FILES],
	authors: [
		'pfernandez98',
		'kishanprmr',
		'MoShizzle',
		'khaledmashaly',
		'abuaboud',
		'AbdullahBitar',
		'Kevinyu-alan'
	],
	auth: googleDocsAuth,
	actions: [
		createDocument,
		createDocumentBasedOnTemplate,
		readDocument,
		findDocumentAction,
		createCustomApiCallAction({
			baseUrl: () => 'https://docs.googleapis.com/v1',
			auth: googleDocsAuth,
			authMapping: async (auth) => ({
				Authorization: `Bearer ${await getAccessToken(auth as GoogleDocsAuthValue)}`,
			}),
		}),
		appendText,
		readDocumentText,
		listRecentDocuments,
		getDocumentOutline,
		searchDocuments,
		countWords,
		copyDocument,
		deleteDocument,
		renameDocument,
		insertTextAtIndex,
		insertTextAtEnd,
		insertHeading,
		replaceText,
		deleteTextRange,
		formatTextRange,
		insertPageBreak,
		insertSectionBreak,
		insertTable,
		createBulletedList,
		createNumberedList,
		shareDocument,
		getShareLink,
		setAnyoneWithLink,
	],
	triggers: [newDocumentTrigger],
});
