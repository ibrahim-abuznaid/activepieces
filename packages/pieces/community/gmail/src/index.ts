import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { gmailSendEmailAction } from './lib/actions/send-email-action';
import { gmailReplyToEmailAction } from './lib/actions/reply-to-email-action';
import { gmailCreateDraftReplyAction } from './lib/actions/create-draft-reply-action';
import { gmailNewEmailTrigger } from './lib/triggers/new-email';
import { gmailNewLabeledEmailTrigger } from './lib/triggers/new-labeled-email';
import { requestApprovalInEmail } from './lib/actions/request-approval-in-email';
import { gmailNewAttachmentTrigger } from './lib/triggers/new-attachment';
import { gmailNewLabelTrigger } from './lib/triggers/new-label';
import { gmailSearchMailAction } from './lib/actions/search-email-action';
import { gmailGetEmailAction } from './lib/actions/get-mail-action';
import { gmailAuth, getAccessToken, GmailAuthValue } from './lib/auth';

import { listMessages } from './lib/actions/agent/list-messages';
import { getMessage } from './lib/actions/agent/get-message';
import { trashMessage } from './lib/actions/agent/trash-message';
import { untrashMessage } from './lib/actions/agent/untrash-message';
import { deleteMessage } from './lib/actions/agent/delete-message';
import { archiveMessage } from './lib/actions/agent/archive-message';
import { markAsRead } from './lib/actions/agent/mark-as-read';
import { markAsUnread } from './lib/actions/agent/mark-as-unread';
import { addLabel } from './lib/actions/agent/add-label';
import { removeLabel } from './lib/actions/agent/remove-label';
import { listLabels } from './lib/actions/agent/list-labels';
import { createLabel } from './lib/actions/agent/create-label';
import { deleteLabel } from './lib/actions/agent/delete-label';
import { updateLabel } from './lib/actions/agent/update-label';
import { getThread } from './lib/actions/agent/get-thread';
import { listThreads } from './lib/actions/agent/list-threads';
import { trashThread } from './lib/actions/agent/trash-thread';
import { listDrafts } from './lib/actions/agent/list-drafts';
import { createDraft } from './lib/actions/agent/create-draft';
import { sendDraft } from './lib/actions/agent/send-draft';
import { deleteDraft } from './lib/actions/agent/delete-draft';
import { getProfile } from './lib/actions/agent/get-profile';
import { getAttachment } from './lib/actions/agent/get-attachment';
import { batchModify } from './lib/actions/agent/batch-modify';

export {
  gmailAuth,
  getAccessToken,
  GmailAuthValue,
  createGoogleClient,
} from './lib/auth';

export const gmail = createPiece({
  minimumSupportedRelease: '0.82.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/gmail.png',
  categories: [
    PieceCategory.COMMUNICATION,
    PieceCategory.BUSINESS_INTELLIGENCE,
  ],
  actions: [
    gmailSendEmailAction,
    requestApprovalInEmail,
    gmailReplyToEmailAction,
    gmailCreateDraftReplyAction,
    gmailGetEmailAction,
    gmailSearchMailAction,
    createCustomApiCallAction({
      baseUrl: () => 'https://gmail.googleapis.com/gmail/v1',
      auth: gmailAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${await getAccessToken(auth as GmailAuthValue)}`,
      }),
    }),
    listMessages,
    getMessage,
    trashMessage,
    untrashMessage,
    deleteMessage,
    archiveMessage,
    markAsRead,
    markAsUnread,
    addLabel,
    removeLabel,
    listLabels,
    createLabel,
    deleteLabel,
    updateLabel,
    getThread,
    listThreads,
    trashThread,
    listDrafts,
    createDraft,
    sendDraft,
    deleteDraft,
    getProfile,
    getAttachment,
    batchModify,
  ],
  displayName: 'Gmail',
  description: 'Email service by Google',

  authors: [
    'kanarelo',
    'abdullahranginwala',
    'BastienMe',
    'Salem-Alaa',
    'kishanprmr',
    'MoShizzle',
    'AbdulTheActivePiecer',
    'khaledmashaly',
    'abuaboud',
    'AdamSelene',
    'sanket-a11y',
    'onyedikachi-david',
  ],
  triggers: [
    gmailNewEmailTrigger,
    gmailNewLabeledEmailTrigger,
    gmailNewAttachmentTrigger,
    gmailNewLabelTrigger,
  ],
  auth: gmailAuth,
});
