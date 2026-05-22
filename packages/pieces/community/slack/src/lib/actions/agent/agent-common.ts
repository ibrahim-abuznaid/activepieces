import { WebClient } from '@slack/web-api';
import { getBotToken, SlackAuthValue } from '../../common/auth-helpers';

const slackClient = (auth: SlackAuthValue): WebClient => {
  return new WebClient(getBotToken(auth));
};

export const slackAgentCommon = {
  slackClient,
};
