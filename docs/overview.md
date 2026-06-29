# Project Overview

This repository contains a full-stack Cloudflare chat application split into two independently built and deployed parts.

## Parts

- `Backend/` contains the Cloudflare Worker that handles authentication, channel access, Durable Objects, and message persistence.
- `Frontend/` contains the React Router application that renders the user interface and connects to the backend.

## Main Flow

1. Users register or log in through the authorization Durable Object.
2. Channel access is validated using `X-Session-Id` and `X-Channel-Id` headers.
3. Messages are stored in per-channel conversation Durable Objects.
4. Uploaded assets are written to Cloudflare R2 when enabled.
