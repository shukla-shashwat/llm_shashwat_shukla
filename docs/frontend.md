# Frontend Guide

The frontend is a React Router application deployed as a separate Cloudflare Worker.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run deploy` - build and deploy the frontend Worker
- `npm run start` - run the app with Wrangler
- `npm run typecheck` - run type generation and TypeScript checks
- `npm run typegen` - generate Cloudflare and React Router types

## Routes

- `/` - landing page
- `/login` - sign-in page
- `/register` - sign-up page
- `/overview` - authenticated overview
- `/channel/:id` - channel view

## Notes

- The frontend serves the built app from `build/client`.
- `nodejs_compat` is enabled in the Worker configuration.
