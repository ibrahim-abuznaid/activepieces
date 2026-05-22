import { createCustomApiCallAction } from '@activepieces/pieces-common';
import {
  OAuth2PropertyValue,
  PieceAuth,
  createPiece,
} from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createClickupTaskComment } from './lib/actions/comments/create-task-comment';
import { getClickupTaskComments } from './lib/actions/comments/get-task-comments';
import { getClickupAccessibleCustomFields } from './lib/actions/custom-fields/get-accessible-custom-fields';
import { setClickupCustomFieldValue } from './lib/actions/custom-fields/set-custom-fields-value';
import { createClickupFolderlessList } from './lib/actions/lists/create-folderless-list';
import { getClickupList } from './lib/actions/lists/get-list';
import { getClickupSpace } from './lib/actions/spaces/get-space';
import { getClickupSpaces } from './lib/actions/spaces/get-spaces';
import { createClickupSubtask } from './lib/actions/tasks/create-subtask';
import { createClickupTask } from './lib/actions/tasks/create-task';
import { createClickupTaskFromTemplate } from './lib/actions/tasks/create-task-from-template';
import { deleteClickupTask } from './lib/actions/tasks/delete-task';
import { filterClickupWorkspaceTasks } from './lib/actions/tasks/filter-workspace-tasks';
import { filterClickupWorkspaceTimeEntries } from './lib/actions/tasks/filter-workspace-time-entries';
import { getClickupTask } from './lib/actions/tasks/get-task';
import { updateClickupTask } from './lib/actions/tasks/update-task';
import { clickupTriggers as triggers } from './lib/triggers';
import { getClickupChannels } from './lib/actions/chat/get-channels';
import { getClickupChannelMessages } from './lib/actions/chat/get-channel-messages';
import { createClickupChannel } from './lib/actions/chat/create-channel';
import { createClickupChannelInSpaceFolderOrList } from './lib/actions/chat/create-channel-in-space-folder-list';
import { getClickupChannel } from './lib/actions/chat/get-channel';
import { createClickupMessage } from './lib/actions/chat/create-message';
import { createClickupMessageReply } from './lib/actions/chat/create-message-reply';
import { createClickupMessageReaction } from './lib/actions/chat/create-message-reaction';
import { getClickupMessageReactions } from './lib/actions/chat/get-message-reactions';
import { getClickupMessageReplies } from './lib/actions/chat/get-message-replies';
import { updateClickupMessage } from './lib/actions/chat/update-message';
import { deleteClickupMessage } from './lib/actions/chat/delete-message';
import { deleteClickupMessageReaction } from './lib/actions/chat/delete-message-reaction';
import { getClickupTaskByName } from './lib/actions/tasks/get-task-by-name';
import { clickupAuth } from './lib/auth';

import { listWorkspaces } from './lib/actions/agent/list-workspaces';
import { listSpaces } from './lib/actions/agent/list-spaces';
import { listFolders } from './lib/actions/agent/list-folders';
import { listLists } from './lib/actions/agent/list-lists';
import { listTasksInList } from './lib/actions/agent/list-tasks-in-list';
import { getWorkspaceMembers } from './lib/actions/agent/get-workspace-members';
import { getUserMe } from './lib/actions/agent/get-user-me';
import { setTaskStatus } from './lib/actions/agent/set-task-status';
import { setTaskPriority } from './lib/actions/agent/set-task-priority';
import { setTaskDueDate } from './lib/actions/agent/set-task-due-date';
import { assignTask } from './lib/actions/agent/assign-task';
import { unassignTask } from './lib/actions/agent/unassign-task';
import { addTaskTag } from './lib/actions/agent/add-task-tag';
import { removeTaskTag } from './lib/actions/agent/remove-task-tag';
import { addTaskLink } from './lib/actions/agent/add-task-link';
import { addTaskDependency } from './lib/actions/agent/add-task-dependency';
import { createChecklist } from './lib/actions/agent/create-checklist';
import { addChecklistItem } from './lib/actions/agent/add-checklist-item';
import { resolveChecklistItem } from './lib/actions/agent/resolve-checklist-item';
import { getTaskSubtasks } from './lib/actions/agent/get-task-subtasks';
import { listMyTasks } from './lib/actions/agent/list-my-tasks';
import { moveTask } from './lib/actions/agent/move-task';
import { duplicateTask } from './lib/actions/agent/duplicate-task';
import { startTimeTracking } from './lib/actions/agent/start-time-tracking';
import { stopTimeTracking } from './lib/actions/agent/stop-time-tracking';
import { searchTasks } from './lib/actions/agent/search-tasks';

export const clickup = createPiece({
  displayName: 'ClickUp',
  description: 'All-in-one productivity platform',
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/clickup.png',
  categories: [PieceCategory.PRODUCTIVITY],
  auth: clickupAuth,
  actions: [
    createClickupTask,
    createClickupTaskFromTemplate,
    createClickupFolderlessList,
    createClickupTaskComment,
    createClickupSubtask,
    createClickupChannel,
    createClickupChannelInSpaceFolderOrList,
    createClickupMessage,
    createClickupMessageReaction,
    createClickupMessageReply,
    getClickupList,
    getClickupTask,
    getClickupTaskByName,
    getClickupSpace,
    getClickupSpaces,
    getClickupTaskComments,
    getClickupChannel,
    getClickupChannels,
    getClickupChannelMessages,
    getClickupMessageReactions,
    getClickupMessageReplies,
    filterClickupWorkspaceTasks,
    filterClickupWorkspaceTimeEntries,
    updateClickupTask,
    updateClickupMessage,
    deleteClickupMessage,
    deleteClickupMessageReaction,
    deleteClickupTask,
    getClickupAccessibleCustomFields,
    setClickupCustomFieldValue,
    createCustomApiCallAction({
      auth: clickupAuth,
      baseUrl: () => {
        return 'https://api.clickup.com/api/v2/';
      },
      authMapping: async (auth) => {
        return {
          Authorization: `Bearer ${auth.access_token}`,
        };
      },
    }),
    listWorkspaces,
    listSpaces,
    listFolders,
    listLists,
    listTasksInList,
    getWorkspaceMembers,
    getUserMe,
    setTaskStatus,
    setTaskPriority,
    setTaskDueDate,
    assignTask,
    unassignTask,
    addTaskTag,
    removeTaskTag,
    addTaskLink,
    addTaskDependency,
    createChecklist,
    addChecklistItem,
    resolveChecklistItem,
    getTaskSubtasks,
    listMyTasks,
    moveTask,
    duplicateTask,
    startTimeTracking,
    stopTimeTracking,
    searchTasks,
  ],
  authors: ["kanarelo","kishanprmr","MoShizzle","khaledmashaly","abuaboud","AbdulTheActivePiecer"],
  triggers,
});
