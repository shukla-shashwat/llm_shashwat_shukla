# Chat Workspace

This repository contains a full-stack Cloudflare chat application split into two independently developed parts:

- `Backend/` is a Cloudflare Worker powered by Durable Objects for authentication, channel authorization, message storage, and WebSocket coordination.
- `Frontend/` is a React Router application that renders the user interface and talks to the backend Worker.

The backend stores application state in Durable Objects and can use R2 for uploaded message assets. The frontend is built with React Router, Vite, and TypeScript, then deployed as a separate Worker.

If you want the longer form documentation, start with [docs/README.md](docs/README.md) and then open the project guides in that folder.

## Overview

The application is structured around a few core concepts:

- Users register and log in through the authorization Durable Object.
- Channels are created and managed on the backend.
- Messages for each channel are stored in a per-channel conversation Durable Object.
- File uploads are written to Cloudflare R2 and then referenced from messages.
- The frontend handles navigation, UI state, and interaction with the backend routes.

## Documentation

The root `docs/` folder contains the supporting project documentation:

- [docs/README.md](docs/README.md) - documentation index
- [docs/overview.md](docs/overview.md) - high-level project summary
- [docs/backend.md](docs/backend.md) - backend setup and bindings
- [docs/frontend.md](docs/frontend.md) - frontend scripts and routes

## Repository Layout

```text
chat/
  Backend/
    src/
      index.ts
      durable-objects/
      types/
    wrangler.jsonc
    package.json
  Frontend/
    app/
    workers/
    wrangler.json
    package.json
    react-router.config.ts
  docs/
    README.md
    overview.md
    backend.md
    frontend.md
```

The repository also includes a frontend-specific README at [Frontend/README.md](Frontend/README.md), but this root file is the main entry point for the whole workspace.

## Prerequisites

Before working on the project, install:

- Node.js 20 or newer
- npm, pnpm, or another compatible package manager
- Cloudflare account access for `wrangler`

If you plan to run the backend locally with Durable Objects and asset uploads, you should also be signed in to Cloudflare through Wrangler.

## Getting Started

Install dependencies separately in each app.

### Backend

The backend uses `pnpm-lock.yaml`, so `pnpm` is the recommended package manager.

```bash
cd Backend
pnpm install
```

### Frontend

The frontend is a React Router app.

```bash
cd Frontend
npm install
```

If your team standardizes on `pnpm`, you can use it here as well, but the repository currently includes only the backend lockfile.

## What Each App Does

### Backend responsibilities

The backend route handler in `Backend/src/index.ts` routes requests into the correct Durable Object based on the request path. It also enforces channel access by checking `X-Session-Id` and `X-Channel-Id` before forwarding channel requests.

The two Durable Objects are:

- `AuthorizationDurableObject` for users, sessions, and access control.
- `ConversationDurableObject` for messages and file uploads.

### Frontend responsibilities

The frontend defines the user-facing routes and layouts, including authentication pages and authenticated channel views. It is responsible for presenting the chat experience and calling the backend APIs with the right session and channel headers.

## Development

Run the backend and frontend in separate terminals.

### Backend dev server

```bash
cd Backend
pnpm dev
```

This starts the Cloudflare Worker locally with Wrangler.

### Frontend dev server

```bash
cd Frontend
npm run dev
```

This starts the React Router development server.

The frontend and backend are separate runtimes, so make sure the frontend is configured to talk to the backend URLs exposed by Wrangler during development.

## Local Setup Checklist

1. Install backend dependencies in `Backend/`.
2. Install frontend dependencies in `Frontend/`.
3. Start the backend Worker with Wrangler.
4. Start the frontend dev server.
5. Register or log in, then open a channel and send a message.

## Build and Deploy

### Backend

```bash
cd Backend
pnpm deploy
```

Useful backend scripts:

- `pnpm dev` - run the Worker locally
- `pnpm start` - alias for `wrangler dev`
- `pnpm deploy` - deploy the backend Worker
- `pnpm cf-typegen` - generate Wrangler types

### Frontend

```bash
cd Frontend
npm run build
npm run deploy
```

Useful frontend scripts:

- `npm run dev` - start the React Router dev server
- `npm run build` - build the production frontend
- `npm run deploy` - build and deploy the frontend Worker
- `npm run start` - run the frontend via Wrangler
- `npm run typecheck` - run Wrangler and TypeScript type generation checks
- `npm run typegen` - generate Cloudflare and React Router types

## Cloudflare Configuration

### Backend bindings

The backend Worker expects these bindings:

- `AUTHORIZATION_DURABLE_OBJECT` - stores users, channels, sessions, and authorization logic
- `CONVERSATION_DURABLE_OBJECT` - stores channel messages
- `MESSAGE_ASSETS` - optional R2 bucket for uploaded assets

The backend `wrangler.jsonc` also defines Durable Object migrations for:

- `AuthorizationDurableObject`
- `ConversationDurableObject`

### Frontend configuration

The frontend Worker is configured to serve the built React Router app from `build/client` and uses `nodejs_compat`.

It also includes a placeholder variable:

- `VALUE_FROM_CLOUDFLARE`

Replace or extend this in `Frontend/wrangler.json` as needed for your deployment environment.

## Application Flow

### Authentication

The authorization Durable Object owns the user and session tables. It handles registration, login, session validation, and channel membership checks.

### Channels

Channel routes are guarded by `X-Session-Id` and `X-Channel-Id` headers. The backend checks access before forwarding requests to the conversation Durable Object.

### Messages

Message history lives in the conversation Durable Object, which supports:

- fetching channel messages
- posting new messages
- uploading message assets to R2

### Frontend routes

The frontend uses these high-level routes:

- `/` - landing page
- `/login` - sign-in page
- `/register` - sign-up page
- `/overview` - authenticated overview
- `/channel/:id` - channel view

## Environment Notes

The backend type definitions currently reference:

- `AUTHORIZATION_DURABLE_OBJECT`
- `CONVERSATION_DURABLE_OBJECT`
- `MESSAGE_ASSETS`

If you add new bindings or durable objects, update the corresponding `wrangler` config and TypeScript environment types together.

## Suggested Local Workflow

1. Start the backend Worker with Wrangler.
2. Start the frontend dev server.
3. Register a user or log in with an existing account.
4. Create or open a channel.
5. Send messages and verify the backend Durable Objects persist the data.

## Notes

- The repository keeps frontend and backend concerns separate, so deployment and local development are also separate.
- Backend message assets are wired for R2, but the bucket configuration is currently commented in the Wrangler files.
- Observability is enabled in both Workers, which is useful when debugging Durable Object state and request flow.