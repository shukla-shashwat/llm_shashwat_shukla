# Backend Guide

The backend is a Cloudflare Worker built with Hono and Durable Objects.

## Scripts

- `pnpm dev` - run the Worker locally with Wrangler
- `pnpm start` - alias for local development
- `pnpm deploy` - deploy the backend Worker
- `pnpm cf-typegen` - generate Wrangler types

## Durable Objects

- `AuthorizationDurableObject` stores users, sessions, and channel membership data.
- `ConversationDurableObject` stores channel messages and file-upload metadata.

## Bindings

- `AUTHORIZATION_DURABLE_OBJECT`
- `CONVERSATION_DURABLE_OBJECT`
- `MESSAGE_ASSETS`

## Notes

- Backend routes rely on request headers to resolve the current session and channel.
- Observability is enabled in `wrangler.jsonc`.
