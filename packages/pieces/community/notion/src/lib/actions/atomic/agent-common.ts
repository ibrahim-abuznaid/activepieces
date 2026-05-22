import { Client } from '@notionhq/client';
import { getNotionToken, NotionAuthValue } from '../../common';

const notionClient = (auth: NotionAuthValue): Client => {
  return new Client({ auth: getNotionToken(auth) });
};

const richText = (
  text: string
): Array<{ type: 'text'; text: { content: string } }> => [
  { type: 'text', text: { content: text } },
];

export const notionAgentCommon = {
  notionClient,
  richText,
};
