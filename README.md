# AI Mystery Room

A responsive, AI powered mystery investigation game. Create a premise, examine evidence, collect clues, request limited hints, and submit one final accusation. The server generates and validates each case with Google Gemini, stores progress in MongoDB, and keeps the solution out of active case responses.

## Requirements

- Node.js 20 or later
- A MongoDB Atlas URI (or local MongoDB URI)
- A Google Gemini API key

## Setup

1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, `GEMINI_API_KEY`, and a supported `GEMINI_MODEL`.
2. Copy `client/.env.example` to `client/.env` if the API will not run at `http://localhost:5000/api`.
3. Install dependencies from the project root and both app folders:

   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

4. Start the client and API together:

   ```bash
   npm run dev
   ```

The Vite client runs at `http://localhost:5173`; the Express API runs at `http://localhost:5000`. You can also start either process with `npm run dev:client` or `npm run dev:server`.

## Environment

Server settings are documented in `server/.env.example`. `CLIENT_URL` accepts a comma separated list of allowed browser origins. `GEMINI_MODEL` is configurable; the example uses `gemini-3.8-flash` with Google's Interactions API. Keep Gemini and database credentials in the server environment only.

The client reads `VITE_API_BASE_URL`. Never put private keys in client environment variables.

## Application flow

- `/` introduces the game; `/create` accepts a premise and difficulty.
- `POST /api/cases` generates the case. The response includes a random case access token once; the browser stores it for subsequent private case operations.
- Active case, clue discovery, hint, accusation, and result APIs require the `x-case-token` header. Only a SHA-256 hash of the access token is stored.
- Suspect, clue, hint, and evidence counts are checked against difficulty settings. Gemini generation receives up to three attempts to return a schema-valid, connected case.
- Active case APIs omit culprit, solution, and reasoning. The result is disclosed only after a valid accusation. Scoring is calculated and persisted by the server.

## Deployment

Deploy `server/` as a Node service (for example, Render) and `client/` as a static Vite site (for example, Vercel). Configure server environment variables in the host dashboard, set `CLIENT_URL` to the deployed client origin, set `VITE_API_BASE_URL` to the deployed API `/api` URL, and build the client with `npm run build`. A live deployment requires project owner credentials and hosting accounts.
