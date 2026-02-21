# Owncast ↔ Matrix Chat Bridge

Exploration of replacing/augmenting Owncast's chat with Matrix.

See **[EXPLORATION.md](./EXPLORATION.md)** for architecture options and design notes.

## Quick Start (Bridge Prototype)

```bash
cd bridge
npm install
cp .env.example .env   # Edit with your Owncast + Matrix credentials
npm run dev
```

Configure Owncast webhooks to point to `http://your-server:3000/webhook`.

## Project Structure

```
owncast-matrix-chat/
├── EXPLORATION.md   # Design doc & architecture options
├── README.md        # This file
└── bridge/          # Node.js bridge prototype (optional)
```
