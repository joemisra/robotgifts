/**
 * Matrix client: send messages, listen for room messages, forward to Owncast
 */

import sdk from 'matrix-js-sdk';

const client = sdk.createClient({
  baseUrl: process.env.MATRIX_HOMESERVER || 'https://matrix.org',
  accessToken: process.env.MATRIX_ACCESS_TOKEN,
  userId: process.env.MATRIX_USER_ID,
});

const ROOM_ID = process.env.MATRIX_ROOM_ID;
const OWNCAST_URL = (process.env.OWNCAST_URL || 'http://localhost:8080').replace(/\/$/, '');
const OWNCAST_TOKEN = process.env.OWNCAST_ACCESS_TOKEN;

async function sendToOwncast(body) {
  const res = await fetch(`${OWNCAST_URL}/api/integrations/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OWNCAST_TOKEN}`,
    },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Owncast API ${res.status}: ${text}`);
  }
  return res.text();
}

export const matrix = {
  async init() {
    if (!process.env.MATRIX_ACCESS_TOKEN || !ROOM_ID) {
      throw new Error('Set MATRIX_ACCESS_TOKEN and MATRIX_ROOM_ID in .env');
    }
    await client.startClient({ initialSyncLimit: 0 });
    return new Promise((resolve) => {
      client.once(sdk.ClientEvent.Sync, (state) => {
        if (state === 'PREPARED') resolve();
      });
    });
  },

  async sendMessage(text) {
    if (!ROOM_ID) return;
    await client.sendTextMessage(ROOM_ID, text);
  },

  async startListening() {
    if (!OWNCAST_TOKEN || !ROOM_ID) {
      console.warn('Owncast forwarding disabled: set OWNCAST_ACCESS_TOKEN and MATRIX_ROOM_ID');
      return;
    }

    client.on(sdk.RoomEvent.Timeline, (event) => {
      if (event.getRoomId() !== ROOM_ID) return;
      if (event.getType() !== 'm.room.message') return;
      if (event.getSender() === client.getUserId()) return; // ignore our own messages

      const content = event.getContent();
      if (content?.msgtype !== 'm.text') return;

      const body = content.body || '';
      if (!body.trim()) return;

      const sender = event.getSender();
      const formatted = `[${sender}] ${body}`;

      sendToOwncast(formatted).catch((err) =>
        console.error('Failed to send to Owncast:', err.message)
      );
    });
  },
};
