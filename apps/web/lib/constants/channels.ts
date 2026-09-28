/**
 * ニコ実況チャンネル情報マッピング
 * jk* -> チャンネル名の変換テーブル
 */

export interface Channel {
  id: string;
  name: string;
  group: string;
}

export const CHANNELS: Channel[] = [
  // 地デジ
  { id: 'jk1', name: 'NHK総合', group: '地デジ' },
  { id: 'jk2', name: 'NHK Eテレ', group: '地デジ' },
  { id: 'jk4', name: '日本テレビ', group: '地デジ' },
  { id: 'jk5', name: 'テレビ朝日', group: '地デジ' },
  { id: 'jk6', name: 'TBSテレビ', group: '地デジ' },
  { id: 'jk7', name: 'テレビ東京', group: '地デジ' },
  { id: 'jk8', name: 'フジテレビ', group: '地デジ' },
  { id: 'jk9', name: 'TOKYO MX', group: '地デジ' },
  { id: 'jk10', name: 'テレ玉', group: '地デジ' },
  { id: 'jk11', name: 'tvk', group: '地デジ' },
  { id: 'jk12', name: 'チバテレビ', group: '地デジ' },
  { id: 'jk13', name: 'サンテレビ', group: '地デジ' },
  { id: 'jk14', name: 'KBS京都', group: '地デジ' },

  // BS・CS
  { id: 'jk101', name: 'NHK BS', group: 'BS・CS' },
  { id: 'jk103', name: 'NHK BSプレミアム', group: 'BS・CS' },
  { id: 'jk141', name: 'BS日テレ', group: 'BS・CS' },
  { id: 'jk151', name: 'BS朝日', group: 'BS・CS' },
  { id: 'jk161', name: 'BS-TBS', group: 'BS・CS' },
  { id: 'jk171', name: 'BSテレ東', group: 'BS・CS' },
  { id: 'jk181', name: 'BSフジ', group: 'BS・CS' },
  { id: 'jk191', name: 'WOWOW PRIME', group: 'BS・CS' },
  { id: 'jk192', name: 'WOWOW LIVE', group: 'BS・CS' },
  { id: 'jk193', name: 'WOWOW CINEMA', group: 'BS・CS' },
  { id: 'jk200', name: 'BS10', group: 'BS・CS' },
  { id: 'jk201', name: 'BS10スターチャンネル', group: 'BS・CS' },
  { id: 'jk211', name: 'BS11', group: 'BS・CS' },
  { id: 'jk222', name: 'BS12 トゥエルビ', group: 'BS・CS' },
  { id: 'jk236', name: 'BSアニマックス', group: 'BS・CS' },
  { id: 'jk252', name: 'WOWOW PLUS', group: 'BS・CS' },
  { id: 'jk260', name: 'BS松竹東急', group: 'BS・CS' },
  { id: 'jk263', name: 'BSJapanext', group: 'BS・CS' },
  { id: 'jk265', name: 'BSよしもと', group: 'BS・CS' },
  { id: 'jk333', name: 'AT-X', group: 'BS・CS' },
];

/**
 * チャンネルID からチャンネル名を取得
 * @param channelId チャンネルID (例: "jk1")
 * @returns チャンネル名 (例: "NHK総合") または undefined
 */
export function getChannelName(channelId: string): string | undefined {
  return CHANNELS.find(ch => ch.id === channelId)?.name;
}

/**
 * グループごとにチャンネルを分類
 */
export const CHANNELS_BY_GROUP = CHANNELS.reduce((acc, channel) => {
  if (!acc[channel.group]) {
    acc[channel.group] = [];
  }
  acc[channel.group].push(channel);
  return acc;
}, {} as Record<string, Channel[]>);
