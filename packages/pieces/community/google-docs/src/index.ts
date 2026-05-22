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

import { readDocumentText } from './lib/actions/atomic/read-document-text';
import { listRecentDocuments } from './lib/actions/atomic/list-recent-documents';
import { getDocumentOutline } from './lib/actions/atomic/get-document-outline';
import { searchDocuments } from './lib/actions/atomic/search-documents';
import { countWords } from './lib/actions/atomic/count-words';
import { copyDocument } from './lib/actions/atomic/copy-document';
import { deleteDocument } from './lib/actions/atomic/delete-document';
import { renameDocument } from './lib/actions/atomic/rename-document';
import { insertTextAtIndex } from './lib/actions/atomic/insert-text-at-index';
import { insertTextAtEnd } from './lib/actions/atomic/insert-text-at-end';
import { insertHeading } from './lib/actions/atomic/insert-heading';
import { replaceText } from './lib/actions/atomic/replace-text';
import { deleteTextRange } from './lib/actions/atomic/delete-text-range';
import { formatTextRange } from './lib/actions/atomic/format-text-range';
import { insertPageBreak } from './lib/actions/atomic/insert-page-break';
import { insertSectionBreak } from './lib/actions/atomic/insert-section-break';
import { insertTable } from './lib/actions/atomic/insert-table';
import { createBulletedList } from './lib/actions/atomic/create-bulleted-list';
import { createNumberedList } from './lib/actions/atomic/create-numbered-list';
import { shareDocument } from './lib/actions/atomic/share-document';
import { getShareLink } from './lib/actions/atomic/get-share-link';
import { setAnyoneWithLink } from './lib/actions/atomic/set-anyone-with-link';
import { createMeetingNotesDoc } from './lib/actions/composite/create-meeting-notes-doc';

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
		'Kevinyu-alan',
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
		createMeetingNotesDoc,
	],
	triggers: [newDocumentTrigger],
});
