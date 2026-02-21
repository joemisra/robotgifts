/**
 * Owncast ↔ Matrix Chat Bridge (prototype)
 *
 * Receives Owncast webhooks, forwards messages to Matrix.
 * Listens to Matrix room, forwards messages to Owncast.
 *
 * Configure Owncast webhooks for: chat.message, chat.userjoined
 */

import express from 'express';
import { matrix } from './matrix.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Owncast webhook payload: { type, eventData: { ... } }
app.post('/webhook', async (req, res) => {
  try {
    const { type, eventData } = req.body || {};
    if (!type) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type === 'CHAT' || type === 'CHAT_MESSAGE' || type === 'chat.message') {
      const msg = eventData?.body || eventData?.message || '';
      const user = eventData?.user?.displayName || eventData?.author || 'Anonymous';
      await matrix.sendMessage(`**${user}**: ${msg}`);
    } else if (type === 'CHAT_USER_JOINED' || type === 'chat.userjoined') {
      const user = eventData?.user?.displayName || eventData?.author || 'Someone';
      await matrix.sendMessage(`_${user} joined the chat_`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

async function main() {
  await matrix.init();
  await matrix.startListening(); // Matrix → Owncast

  app.listen(PORT, () => {
    console.log(`Bridge running on http://localhost:${PORT}`);
    console.log('Configure Owncast webhook URL:', `http://your-host:${PORT}/webhook`);
  });
}

main().catch(console.error);
