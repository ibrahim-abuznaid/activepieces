import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { notionAuth } from './lib/auth';
import { getNotionToken, NotionAuthValue } from './lib/common';
import { appendToPage } from './lib/actions/append-to-page';
import { createDatabaseItem } from './lib/actions/create-database-item';
import { createPage } from './lib/actions/create-page';
import { updateDatabaseItem } from './lib/actions/update-database-item';
import { newDatabaseItem } from './lib/triggers/new-database-item';
import { updatedDatabaseItem } from './lib/triggers/updated-database-item';
import { newComment } from './lib/triggers/new-comment';
import { updatedPage } from './lib/triggers/updated-page';
import { findDatabaseItem } from './lib/actions/find-item';
import { getPageOrBlockChildren } from './lib/actions/get-page-or-block-children';
import { archiveDatabaseItem } from './lib/actions/archive-database-item';
import { restoreDatabaseItem } from './lib/actions/restore-database-item';
import { addComment } from './lib/actions/add-comment';
import { retrieveDatabase } from './lib/actions/retrieve-database';
import { getPageComments } from './lib/actions/get-page-comments';
import { findPage } from './lib/actions/find-page';

import { searchNotion } from './lib/actions/atomic/search-notion';
import { getPage } from './lib/actions/atomic/get-page';
import { archivePage } from './lib/actions/atomic/archive-page';
import { unarchivePage } from './lib/actions/atomic/unarchive-page';
import { queryDatabase } from './lib/actions/atomic/query-database';
import { listPageBlocks } from './lib/actions/atomic/list-page-blocks';
import { getBlock } from './lib/actions/atomic/get-block';
import { deleteBlock } from './lib/actions/atomic/delete-block';
import { addParagraph } from './lib/actions/atomic/add-paragraph';
import { addHeading } from './lib/actions/atomic/add-heading';
import { addTodo } from './lib/actions/atomic/add-todo';
import { addBulletedList } from './lib/actions/atomic/add-bulleted-list';
import { addNumberedList } from './lib/actions/atomic/add-numbered-list';
import { addCodeBlock } from './lib/actions/atomic/add-code-block';
import { addCallout } from './lib/actions/atomic/add-callout';
import { listUsers } from './lib/actions/atomic/list-users';
import { getMe } from './lib/actions/atomic/get-me';
import { getPageProperty } from './lib/actions/atomic/get-page-property';
import { updatePageProperties } from './lib/actions/atomic/update-page-properties';
import { createBlankPage } from './lib/actions/atomic/create-blank-page';
import { retrieveDatabaseSchema } from './lib/actions/atomic/retrieve-database-schema';
import { listComments as listCommentsAgent } from './lib/actions/atomic/list-database-comments';
import { addCommentAgent } from './lib/actions/atomic/add-comment';
import { createDailyStandup } from './lib/actions/composite/create-daily-standup';

export const notion = createPiece({
  displayName: 'Notion',
  description: 'The all-in-one workspace',
  logoUrl: 'https://cdn.activepieces.com/pieces/notion.png',
  categories: [PieceCategory.PRODUCTIVITY],
  minimumSupportedRelease: '0.30.0',
  authors: [
    'ShayPunter',
    'kishanprmr',
    'MoShizzle',
    'khaledmashaly',
    'abuaboud',
    'AdamSelene',
    'ezhil56x',
    'onyedikachi-david',
  ],
  auth: notionAuth,
  actions: [
    createDatabaseItem,
    updateDatabaseItem,
    findDatabaseItem,
    createPage,
    appendToPage,
    getPageOrBlockChildren,
    archiveDatabaseItem,
    restoreDatabaseItem,
    addComment,
    retrieveDatabase,
    getPageComments,
    findPage,
    createCustomApiCallAction({
      baseUrl: () => 'https://api.notion.com/v1',
      auth: notionAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${getNotionToken(auth as NotionAuthValue)}`,
      }),
    }),
    searchNotion,
    getPage,
    archivePage,
    unarchivePage,
    queryDatabase,
    listPageBlocks,
    getBlock,
    deleteBlock,
    addParagraph,
    addHeading,
    addTodo,
    addBulletedList,
    addNumberedList,
    addCodeBlock,
    addCallout,
    listUsers,
    getMe,
    getPageProperty,
    updatePageProperties,
    createBlankPage,
    retrieveDatabaseSchema,
    listCommentsAgent,
    addCommentAgent,
    createDailyStandup,
  ],
  triggers: [newDatabaseItem, updatedDatabaseItem, newComment, updatedPage],
});
