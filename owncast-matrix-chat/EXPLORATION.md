# Owncast + Matrix Chat Integration — Exploration

An exploration of replacing or augmenting Owncast's built-in chat with Matrix-based chat.

---

## Current State

### Owncast Chat
- **Real-time**: WebSocket-based delivery
- **APIs**: REST endpoints for sending messages, system messages, chat actions
- **Webhooks**: HTTP POST on chat events (message sent, user joined, name change)
- **Frontend**: React component, part of the main web UI
- **Auth**: Access tokens with scopes (`CAN_SEND_MESSAGES`, `CAN_SEND_SYSTEM_MESSAGES`, `HAS_ADMIN_ACCESS`)

### Matrix
- **Protocol**: Decentralized, federated messaging
- **APIs**: Client-Server API (send/receive), Application Service API (gateways, bots)
- **SDKs**: matrix-js-sdk (JS/TS), matrix-nio (Python), etc.
- **Clients**: Element, FluffyChat, or custom embedded clients

---

## Integration Approaches

### Approach 1: Bridge (Two-Way Sync)
**Owncast Chat ↔ Matrix Room**

A service that:
- Listens to Owncast webhooks for new chat messages
- Forwards them to a Matrix room
- Listens to Matrix room messages and posts them to Owncast via `/api/integrations/chat/send`

**Pros**: Keeps both systems in sync, viewers can use either
**Cons**: Duplicate messages if both used; need to handle user identity mapping

### Approach 2: Matrix-Only (Replace Chat UI)
**Embed Matrix client, disable Owncast chat**

- Use External Actions or custom JS to embed an Element Web iframe (or custom Matrix client)
- Disable Owncast's built-in chat
- Each stream = one Matrix room (or room per stream session)

**Pros**: Full Matrix features (E2EE, federation, rich clients)
**Cons**: No integration with Owncast's viewer list; separate auth

### Approach 3: Hybrid Bridge + Embedded Client
**Bridge for backend, Matrix UI for display**

- Bridge syncs Owncast system messages (stream started, etc.) into Matrix
- Replace chat panel with embedded Matrix client
- Owncast API used only for admin/system messages

**Pros**: Best of both — Matrix UX with Owncast awareness
**Cons**: Most complex to build

---

## Recommended Starting Point: Bridge (Approach 1)

A small bridge service is the fastest way to validate the idea:

```
┌─────────────┐     webhooks      ┌──────────────────┐     Matrix CS API    ┌─────────────┐
│   Owncast   │ ───────────────►  │  Bridge Service  │ ◄─────────────────►  │   Matrix    │
│   (chat)    │                   │  (Node/Python)   │                      │  Homeserver │
└─────────────┘                   └──────────────────┘                      └─────────────┘
       ▲                                   │
       │         REST API (send)            │
       └───────────────────────────────────┘
```

### Bridge Components
1. **Webhook receiver** — Accept Owncast webhook POSTs, parse chat events
2. **Matrix client** — Login as bot user, send messages to configured room
3. **Matrix listener** — Listen for room messages, POST to Owncast `/api/integrations/chat/send`
4. **Config** — Owncast URL + token, Matrix homeserver + credentials, room ID

### Tech Stack Options
| Language | Matrix SDK | Notes |
|----------|------------|-------|
| Node.js | matrix-js-sdk | Good for webhooks, async |
| Python | matrix-nio | Simple, good for scripts |
| Go | gomatrix | Lightweight |

---

## Owncast APIs to Use

| Endpoint | Purpose |
|----------|---------|
| `POST /api/integrations/chat/send` | Send chat message (from Matrix → Owncast) |
| Webhook: `chat.message` | Receive new messages (Owncast → Matrix) |
| Webhook: `chat.userjoined` | Optional: announce joins in Matrix |
| `GET /api/integrations/chat` | Optional: backfill history on startup |

---

## Matrix Setup

1. **Homeserver**: Self-host Synapse/Dendrite, or use matrix.org
2. **Bot user**: Create account for the bridge (e.g. `@owncast-bot:yourdomain.com`)
3. **Room**: Create a room per stream, or one room for all streams
4. **Invite**: Bridge bot must be in the room to send/receive

---

## Next Steps

1. **Spike**: Build minimal bridge (webhook → Matrix send only) to prove flow
2. **Bidirectional**: Add Matrix → Owncast send
3. **User mapping**: Consider `@username:server` ↔ Owncast display names
4. **UI**: If bridge works well, explore embedding Element or custom client via External Actions

---

## References

- [Owncast API Docs](https://owncast.online/docs/api)
- [Owncast Webhooks](https://owncast.online/thirdparty/webhooks/)
- [Owncast External Actions](https://owncast.online/thirdparty/actions/)
- [Matrix Client-Server API](https://spec.matrix.org/v1.11/client-server-api/)
- [matrix-js-sdk](https://github.com/matrix-org/matrix-js-sdk)
