# AI Mystery Room

A responsive, AI-powered mystery investigation game. Create a premise, examine evidence, collect clues, request limited hints, and submit one final accusation. The Node/Express server generates and validates cases with Google Gemini, stores progress in MongoDB, and keeps the culprit and solution out of active case responses.

## Requirements

- Node.js 20 or later
- MongoDB Atlas (or a local MongoDB instance)
- Google Gemini API key

## Run locally

1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and `GEMINI_API_KEY`.
2. Install dependencies from the project root and in both app folders:

   ```bash
   npm install
   npm --prefix server ci
   npm --prefix client ci
   ```

3. Run `npm run dev`. Vite serves the frontend at `http://localhost:5173` and proxies `/api` to Express at `http://localhost:5000`.
4. For a production-like local check, run `npm run build`, then `npm start`. Express serves both the API and `client/dist` at `http://localhost:5000`.

The frontend uses `/api` on the current origin; it does not need a frontend API URL. `GEMINI_MODEL` is configurable in the server environment. Keep MongoDB and Gemini credentials in the server environment only.

## Deploy as one Render Web Service

The repository's root `render.yaml` defines exactly one Render Web Service. It builds the client and server dependencies, creates the Vite production bundle, and starts Express, which serves the built frontend and API from the same public URL. No separate frontend service or Vercel project is required.

### 1. Push the project to a Git repository

Create or use a GitHub repository accessible to Render and push this project when you are ready. Confirm that `.env` files are not committed. `.gitignore` excludes environment files, dependency folders, build output, and common private-key files. Never add secrets to `render.yaml` or source control.

### 2. Prepare MongoDB Atlas

1. Create or select an Atlas cluster and create a database user with only the permissions this app needs.
2. In Atlas **Network Access**, allow the outbound IP ranges shown for the Render Web Service's region under its **Connect > Outbound** information. Use the narrowest ranges available; avoid `0.0.0.0/0`.
3. Copy the MongoDB driver connection string, replace the user/password placeholders, URL-encode special characters in the password, and include a database name, for example `ai-mystery-room`.

Atlas accepts connections only from allowlisted addresses. Render may use any address in the ranges it lists for the service. [Render's Atlas guide](https://render.com/docs/connect-to-mongodb-atlas) · [Atlas IP access list](https://www.mongodb.com/docs/atlas/security/ip-access-list/)

### 3. Create the single Render service

1. In Render, choose **New > Blueprint** and connect the repository containing the root `render.yaml`.
2. Review the Blueprint before creating it. It should contain only one service named `ai-mystery-room`, with the repository root as its working directory, build command:

   ```bash
   npm ci && npm --prefix server ci && npm --prefix client ci && npm --prefix client run build
   ```

   and start command:

   ```bash
   npm --prefix server start
   ```

3. Enter the secret values requested by the Blueprint:
   - `MONGODB_URI`: your Atlas connection string
   - `GEMINI_API_KEY`: your Gemini API key
4. Create the service and wait for the build and deploy to complete. Render supplies `PORT`; Express binds to `0.0.0.0` and uses that port. `GEMINI_MODEL` is set to `gemini-3.5-flash-lite` by the Blueprint and can be changed in Render's environment settings.
5. Render assigns one public URL such as `https://ai-mystery-room.onrender.com`. The API and frontend are both served from this origin.

`MONGODB_URI` and `GEMINI_API_KEY` are Blueprint variables marked `sync: false`: enter them in Render's dashboard prompt, where they remain server-side. Do not define either as a `VITE_` variable. [Render Blueprint configuration](https://render.com/docs/blueprint-spec) · [Render environment variables](https://render.com/docs/configure-environment-variables)

### 4. Verify the deployment

1. Visit `https://<your-service>.onrender.com/api/health`. The expected response is `{"success":true,"status":"ok"}`.
2. Visit the base service URL and create a mystery.
3. Check a direct frontend route such as `/create`, then refresh it. Express should return the React app shell for client-side routes.
4. Play through evidence inspection, clue discovery, hints, accusation, and results. Review Render logs if MongoDB or Gemini reports an error.

### Troubleshooting

- **MongoDB timeout:** check Atlas Network Access, the connection URI, database user, and URL-encoded password.
- **Gemini generation fails:** check `GEMINI_API_KEY`, `GEMINI_MODEL`, quota, and Render logs.
- **Frontend API requests fail:** the frontend uses same-origin `/api` requests. Confirm the single service is healthy and that you deployed the latest build.
- **Slow first request:** some Render plans spin down idle services, making the first request after inactivity slower.

## Application flow

- `/` introduces the game; `/create` accepts a premise and difficulty.
- `POST /api/cases` generates a case. The response includes a random case access token once, and the browser stores it for subsequent private case operations.
- Active case, clue discovery, hint, accusation, and result APIs require the `x-case-token` header. Only a SHA-256 hash of the access token is stored.
- Suspect, clue, hint, and evidence counts are checked against difficulty settings. Gemini generation receives up to three attempts to return a schema-valid, connected case.
- Active case APIs omit culprit, solution, and reasoning. The result is disclosed only after a valid accusation. Scoring is calculated and persisted by the server.
