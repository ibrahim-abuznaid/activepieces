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

import { listMessages } from './lib/actions/atomic/list-messages';
import { getMessage } from './lib/actions/atomic/get-message';
import { trashMessage } from './lib/actions/atomic/trash-message';
import { untrashMessage } from './lib/actions/atomic/untrash-message';
import { deleteMessage } from './lib/actions/atomic/delete-message';
import { archiveMessage } from './lib/actions/atomic/archive-message';
import { markAsRead } from './lib/actions/atomic/mark-as-read';
import { markAsUnread } from './lib/actions/atomic/mark-as-unread';
import { addLabel } from './lib/actions/atomic/add-label';
import { removeLabel } from './lib/actions/atomic/remove-label';
import { listLabels } from './lib/actions/atomic/list-labels';
import { createLabel } from './lib/actions/atomic/create-label';
import { deleteLabel } from './lib/actions/atomic/delete-label';
import { updateLabel } from './lib/actions/atomic/update-label';
import { getThread } from './lib/actions/atomic/get-thread';
import { listThreads } from './lib/actions/atomic/list-threads';
import { trashThread } from './lib/actions/atomic/trash-thread';
import { listDrafts } from './lib/actions/atomic/list-drafts';
import { createDraft } from './lib/actions/atomic/create-draft';
import { sendDraft } from './lib/actions/atomic/send-draft';
import { deleteDraft } from './lib/actions/atomic/delete-draft';
import { getProfile } from './lib/actions/atomic/get-profile';
import { getAttachment } from './lib/actions/atomic/get-attachment';
import { batchModify } from './lib/actions/atomic/batch-modify';
import { triageInbox } from './lib/actions/composite/triage-inbox';

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
    triageInbox,
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
