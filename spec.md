# SPEC.md — AI Mystery Room

**Document Type:** Product & Technical Specification  
**Project Name:** AI Mystery Room  
**Version:** 1.0  
**Status:** Approved Baseline for Development  
**Development Approach:** Spec-Driven Development  
**Primary AI Provider:** Google Gemini  
**Architecture:** MERN Stack  

---

# 1. PROJECT OVERVIEW

## 1.1 Project Description

AI Mystery Room is an AI-powered interactive mystery investigation web application. It allows users to create their own fictional mystery challenges by providing a short scenario, story, or situation.

The application uses Google Gemini AI on the backend to transform the user's input into a complete fictional investigation containing:

- A mystery title and background story.
- Multiple suspects with individual profiles and motives.
- A hidden culprit selected by the AI.
- AI-generated evidence such as WhatsApp conversations, photographs, CCTV footage representations, documents, and witness statements.
- Hints to help users investigate.
- A final explanation connecting the evidence to the culprit.

The user investigates the available evidence, analyzes the suspects, and selects the person they believe is responsible.

After submitting the accusation, the application reveals the actual culprit, explains the investigation, and calculates the player's score.

## 1.2 Problem Statement

Traditional mystery-solving games generally use predefined stories, fixed clues, and predetermined outcomes. This limits replayability and prevents users from creating investigation scenarios based on their own ideas.

AI Mystery Room addresses this limitation by using generative AI to dynamically create fictional investigation scenarios, suspects, evidence, and solutions based on user-provided premises.

The application provides an interactive investigation experience where users must analyze different forms of evidence, identify inconsistencies, connect clues, and make a final accusation.

## 1.3 Project Goals

1. Allow users to create personalized mystery challenges using natural-language descriptions.
2. Generate logically consistent investigations using Gemini AI.
3. Create different fictional evidence formats, including chats, images, and CCTV-style recordings.
4. Provide interactive suspect investigation and clue discovery.
5. Implement a hint system to assist users.
6. Evaluate the user's final accusation using backend-controlled scoring.
7. Provide a detailed explanation of the mystery after completion.
8. Deliver a responsive, visually engaging mystery-solving experience.

## 1.4 Target Users

- Students interested in interactive AI applications.
- Mystery and detective story enthusiasts.
- Users interested in logical reasoning and problem-solving.
- Casual gamers looking for AI-generated challenges.

---

# 2. TECHNOLOGY STACK

The following technologies are the official technology choices for this project.

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React.js | User interface |
| Build Tool | Vite | Frontend development and build |
| Styling | Tailwind CSS | Responsive UI and styling |
| Routing | React Router DOM | Page navigation |
| HTTP Client | Axios | Frontend-backend communication |
| Backend | Node.js | Server-side runtime |
| Framework | Express.js | REST API development |
| Database | MongoDB Atlas | Persistent data storage |
| ODM | Mongoose | MongoDB schemas and operations |
| AI | Google Gemini API | Mystery and evidence generation |
| Validation | Zod | Request and AI response validation |
| Icons | Lucide React | Interface icons |
| Deployment | Vercel + Render | Frontend and backend hosting |

### 2.1 Architecture

The application must follow a client-server architecture.

**Frontend:** React application handles user interaction, navigation, mystery presentation, evidence inspection, and results.

**Backend:** Express application handles API requests, Gemini integration, mystery generation, validation, scoring, and access control.

**Database:** MongoDB stores generated mysteries, suspects, clues, evidence, hints, and player progress.

**AI Layer:** Gemini generates the fictional investigation and its supporting evidence in structured JSON format.

### 2.2 Technology Rules

- Use JavaScript throughout the project.
- Use React functional components and React Hooks.
- Use Tailwind CSS for styling.
- Use Axios for API requests.
- Use Express REST APIs.
- Use Mongoose for database operations.
- All Gemini API calls must happen on the backend.
- Never expose API keys in frontend code.
- Keep frontend and backend in separate directories.
- Use environment variables for sensitive configuration.

---

# 3. FUNCTIONAL REQUIREMENTS

## 3.1 Mystery Creation

The user must be able to create a mystery by entering a short scenario or story.

**Input fields:**

1. Mystery premise: Required textarea.
2. Difficulty level: Easy, Medium, or Hard.
3. Generate Mystery button.

**Input validation:**

- Premise is required.
- Minimum premise length: 20 characters.
- Maximum premise length: 1,000 characters.
- Difficulty must be one of the three supported values.
- Empty or invalid submissions must be rejected.
- The application must prevent duplicate submissions while generation is in progress.

**Example input:**

"A valuable diamond disappears during a birthday party at a luxury hotel. Five guests were present, and everyone claims they did not take it."

The application must use this premise as the foundation of the generated investigation.

## 3.2 AI Mystery Generation

When the user clicks Generate Mystery:

1. Frontend sends the premise and difficulty to the backend.
2. Backend validates the input.
3. Backend sends a structured generation prompt to Gemini.
4. Gemini generates the investigation.
5. Backend validates the generated JSON.
6. Backend checks the mystery's logical consistency.
7. Backend stores the mystery in MongoDB.
8. Backend returns the public investigation data to the frontend.

The generated mystery must contain:

- Unique mystery ID.
- Mystery title.
- Introduction and background story.
- Incident description.
- Suspect profiles.
- Evidence items.
- Available hints.
- Hidden culprit ID.
- Correct solution and reasoning.

The culprit and solution must remain private until the user submits an accusation.

## 3.3 Difficulty Configuration

Difficulty determines the number of suspects, clues, and available hints.

| Difficulty | Suspects | Clues | Hints | Correct Base Score |
|---|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

The backend must enforce these configurations regardless of the AI response.

## 3.4 Suspect Investigation

Each suspect must have:

- Unique suspect ID.
- Full name.
- Age (fictional).
- Occupation or relationship to the incident.
- Short biography.
- Motive.
- Alibi.
- Personality description.
- Profile image or AI-generated avatar.

Important requirements:

- Each suspect must have a distinct identity.
- Suspects must have believable motives or connections to the incident.
- At least one suspect must have evidence that creates reasonable suspicion.
- The actual culprit must be identifiable through the combined evidence.
- Suspect profiles must not directly reveal the culprit.

The frontend must display suspects as interactive cards.

Selecting a suspect should open a detailed suspect profile.

## 3.5 Evidence Investigation

Evidence is the central feature of the application.

The AI must generate fictional evidence that users can examine to solve the mystery.

### Supported Evidence Types

**A. WhatsApp Messages**

Display fictional chat conversations between characters.

Each chat must contain:
- Sender name.
- Receiver name.
- Message content.
- Timestamp.
- Conversation context.

The interface should resemble a messaging application.

**B. Photographic Evidence**

Generate or provide AI-generated fictional investigation images.

Examples:
- Crime scene photographs.
- Objects found at the location.
- Suspicious items.
- Damaged objects.
- Relevant environmental details.

Each image must have:
- Evidence title.
- Image or image-generation prompt.
- Description.
- Discovery explanation.

Use an image-generation capability through a backend provider adapter where available. If image generation is unavailable, provide a clearly labeled visual placeholder with its generated description. Do not silently present a text description as an actual generated photograph.

**C. CCTV Evidence**

Represent fictional security-camera observations.

Each CCTV item must contain:
- Camera location.
- Recording time.
- Incident timestamp.
- Description of observed events.
- Relevant sequence of frames or observations.
- Evidence interpretation.

For the first version, CCTV must be represented as a simulated recording interface with timestamps, frame descriptions, and optional AI-generated still images. Actual AI-generated video production is not required for the MVP.

**D. Document Evidence**

Examples:
- Receipts.
- Emails.
- Letters.
- Access logs.
- Reports.
- Transaction records.

**E. Witness Statements**

Each statement must contain:
- Witness name.
- Statement.
- Time recorded.
- Related suspect or incident.
- Possible inconsistencies.

### Evidence Behavior

- Evidence must be displayed in an investigation dashboard.
- Evidence must be individually accessible.
- Users must be able to open evidence in a detailed view or modal.
- Evidence must contain a unique ID.
- Users must be able to discover clues.
- The backend must record discovered evidence.
- The same evidence must not award points multiple times.
- The interface must indicate which evidence has been discovered.

Each mystery must have the exact clue count defined by its difficulty.

Different evidence formats can be used to present those clues. For example, a WhatsApp conversation may contain one or more relevant pieces of information, but the total number of scored clues must remain fixed.

## 3.6 Hint System

Users can request hints when they need assistance.

Hint rules:

- Easy: 2 hints.
- Medium: 3 hints.
- Hard: 3 hints.

Each hint should progressively guide the player without directly revealing the culprit.

Example:

- Hint 1: Focus on the time of the incident.
- Hint 2: Compare the suspect's alibi with the CCTV observations.
- Hint 3: Examine the inconsistency in the conversation.

Requirements:

- Display the number of remaining hints.
- Deduct one hint whenever a hint is requested successfully.
- Do not provide more hints than the allowed limit.
- Record every hint request in the backend.
- Hints must not expose the hidden culprit ID.
- Hints must be generated as part of the original investigation and stored before gameplay.

## 3.7 Final Accusation

After investigating, the user must be able to submit a final accusation.

The accusation screen must:

- Display all suspects.
- Allow selection of exactly one suspect.
- Provide an explicit Submit Accusation button.
- Require confirmation before submission.
- Prevent multiple final accusations.

The backend must compare the selected suspect ID with the hidden culprit ID.

Once submitted, the investigation must be marked as completed.

## 3.8 Results and Scoring

The results screen must display:

- Correct or incorrect verdict.
- Actual culprit's name.
- Selected suspect's name.
- Final score.
- Correct explanation.
- Important clues that establish the solution.
- A Play Again button.

### Scoring Formula

For a correct accusation:

**Final Score = Base Score + (Discovered Clues × 5) − (Hints Used × 10)**

For an incorrect accusation:

**Final Score = 0**

Minimum score = 0.

The backend must calculate the score.

Example:

Difficulty: Medium

- Correct base score = 150
- Discovered clues = 6
- Hints used = 1

Final Score = 150 + (6 × 5) − (1 × 10)

**Final Score = 170 points.**

The frontend must never calculate or determine the official score.

---

# 4. COMPLETE USER FLOW

The application must follow this sequence:

1. User opens the AI Mystery Room website.
2. User lands on the Home page.
3. User clicks Start Investigation.
4. User enters a mystery premise.
5. User selects a difficulty level.
6. User clicks Generate Mystery.
7. Backend sends the premise to Gemini.
8. Gemini creates the mystery, suspects, clues, hints, and hidden solution.
9. Backend validates and stores the generated mystery.
10. User enters the Investigation Room.
11. User reads the mystery introduction.
12. User explores suspect profiles.
13. User discovers and examines evidence.
14. User requests hints if necessary.
15. User reviews the collected clues.
16. User selects a suspect.
17. User confirms the final accusation.
18. Backend validates the accusation and calculates the score.
19. Results page displays the verdict and actual culprit.
20. User can start a new mystery.

### User Flow Diagram

Home → Create Mystery → AI Generation → Investigation Room → Examine Suspects and Evidence → Request Hints → Final Accusation → Results → New Mystery.

---

# 5. UI AND PAGE SPECIFICATIONS

The website must have a modern detective-investigation theme.

## 5.1 Design Direction

**Theme:** Dark Detective / Mystery Investigation.

**Visual direction:**
- Dark backgrounds.
- Charcoal and deep navy surfaces.
- Purple or electric blue accents.
- Subtle gradients.
- Evidence-card layouts.
- Clear typography.
- Smooth transitions and hover interactions.
- Minimal visual clutter.

The interface should feel like a professional investigation dashboard rather than a conventional form-based website.

Use a consistent design system throughout the application.

### Suggested Color Palette

| Purpose | Color |
|---|---|
| Main Background | #0B0D12 |
| Secondary Background | #151923 |
| Card Background | #1C2230 |
| Primary Accent | #8B5CF6 |
| Secondary Accent | #38BDF8 |
| Primary Text | #F8FAFC |
| Secondary Text | #94A3B8 |
| Success | #22C55E |
| Danger | #EF4444 |

## 5.2 Home Page

**Purpose:** Introduce the project and encourage users to create a mystery.

Required components:
- Website logo and navigation.
- Hero section.
- Project title: AI Mystery Room.
- Short description.
- Start Investigation button.
- How It Works section.
- Feature highlights.
- Footer.

The Start Investigation button must navigate to the Create Mystery page.

## 5.3 Create Mystery Page

**Purpose:** Collect user input.

Required components:
- Page heading.
- Mystery premise textarea.
- Example premise suggestions.
- Difficulty selector.
- Difficulty descriptions.
- Generate Mystery button.
- Input validation messages.

The Generate button must display a loading state while the backend generates the mystery.

## 5.4 Mystery Generation Loading State

Display an engaging loading screen with messages such as:

- Creating your mystery...
- Building suspect profiles...
- Preparing investigation evidence...
- Connecting the clues...
- Finalizing the case...

These messages are visual progress indicators, not claims about the exact internal Gemini processing stage.

Prevent duplicate submissions during generation.

## 5.5 Investigation Room

**Purpose:** Main gameplay screen.

Required sections:

**A. Investigation Header**
- Mystery title.
- Difficulty.
- Case status.
- Investigation progress.

**B. Story Section**
- Incident background.
- Case description.
- Investigation objective.

**C. Suspects Section**
- Suspect cards.
- Profile images or avatars.
- Name and basic information.
- View Profile interaction.

**D. Evidence Section**
- Evidence cards.
- Evidence type labels.
- Evidence discovery status.
- Open Evidence interaction.

**E. Hint Section**
- Remaining hints.
- Request Hint button.
- Hint display area.

**F. Investigation Actions**
- View discovered clues.
- Review suspects.
- Proceed to accusation.

The page must clearly distinguish discovered and undiscovered clues.

## 5.6 Evidence Detail View

When the user selects evidence, open a modal or dedicated detail panel.

Display:
- Evidence title.
- Evidence category.
- Image, simulated chat, CCTV representation, or document.
- Detailed description.
- Timestamp where applicable.
- Discover Clue action.

The user must be able to close the detail view and return to the investigation room.

## 5.7 Accusation Page

**Purpose:** Collect the player's final suspect selection.

Required components:
- Final accusation heading.
- Suspect selection cards.
- Selected suspect indicator.
- Confirmation dialog.
- Submit Accusation button.

Once submitted, the user must not be allowed to modify the accusation.

## 5.8 Results Page

**Purpose:** Reveal the investigation outcome.

Required components:
- Verdict banner.
- Correct culprit profile.
- User's accusation.
- Final score.
- Score breakdown.
- Complete solution explanation.
- Key evidence supporting the conclusion.
- Play Again button.

Do not expose the solution before the accusation is submitted.

---

# 6. BACKEND ARCHITECTURE

## 6.1 Folder Structure

Use the following project structure:

```text
ai-mystery-room/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SuspectCard.jsx
│   │   │   ├── EvidenceCard.jsx
│   │   │   ├── HintPanel.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CreateMystery.jsx
│   │   │   ├── InvestigationRoom.jsx
│   │   │   ├── Accusation.jsx
│   │   │   └── Results.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── MysteryContext.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── caseController.js
│   ├── models/
│   │   └── Case.js
│   ├── routes/
│   │   └── caseRoutes.js
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── mysteryGenerator.js
│   │   └── scoringService.js
│   ├── validators/
│   │   └── caseValidator.js
│   ├── middleware/
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   └── promptTemplates.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

Codex may introduce additional files when required, but it must preserve this separation of responsibilities.

---

# 7. DATABASE DESIGN

Use MongoDB Atlas with Mongoose.

## 7.1 Case Collection

Create a Mongoose model named `Case`.

Each case must contain the following fields:

| Field | Type | Description |
|---|---|---|
| title | String | Mystery title |
| premise | String | Original user input |
| story | String | Generated story |
| incidentDescription | String | Incident details |
| difficulty | String | Easy / Medium / Hard |
| suspects | Array | Suspect information |
| clues | Array | Generated clues |
| evidence | Array | Evidence details |
| hints | Array | Available hints |
| culpritId | String | Hidden correct suspect ID |
| solutionExplanation | String | Hidden final explanation |
| discoveredClueIds | Array | Discovered clues |
| hintsUsed | Number | Number of hints requested |
| accusation | String | Selected suspect ID |
| score | Number | Final score |
| status | String | Active / Completed |
| createdAt | Date | Creation timestamp |
| completedAt | Date | Completion timestamp |

## 7.2 Suspect Structure

Each suspect object must contain:

```json
{
  "suspectId": "S1",
  "name": "Alex Morgan",
  "age": 32,
  "occupation": "Hotel Manager",
  "relationship": "Employee",
  "biography": "Short fictional profile",
  "motive": "Possible reason for involvement",
  "alibi": "Claimed whereabouts",
  "personality": "Personality description",
  "avatarPrompt": "Description for generating an avatar"
}
```

## 7.3 Clue Structure

Each clue must contain:

```json
{
  "clueId": "C1",
  "title": "Unusual Access Record",
  "description": "Description of the clue",
  "evidenceType": "document",
  "evidenceId": "E1",
  "relevance": "How the clue contributes to the investigation"
}
```

## 7.4 Evidence Structure

Each evidence item must contain:

```json
{
  "evidenceId": "E1",
  "title": "Suspicious Conversation",
  "type": "whatsapp",
  "description": "Description of the evidence",
  "content": {},
  "relatedSuspectIds": ["S1", "S2"],
  "timestamp": "2026-11-02T10:30:00Z",
  "clueIds": ["C1"]
}
```

The `content` object will vary according to the evidence type.

For example, WhatsApp evidence contains messages, CCTV evidence contains recording observations and timestamps, and image evidence contains an asset reference and description.

## 7.5 Player Progress

Player progress must be stored within the case document for the MVP.

It must include:
- Discovered clue IDs.
- Hints used.
- Selected accusation.
- Completion status.
- Final score.

**Important:** The actual culprit ID, solution explanation, and secret reasoning must never be included in public API responses before the accusation.

---

# 8. API SPECIFICATION

All backend endpoints must use the `/api` prefix.

Base URL during local development:

`http://localhost:5000/api`

## 8.1 Generate Mystery

**Endpoint:** `POST /api/cases`

Request:

```json
{
  "premise": "A diamond disappeared during a party.",
  "difficulty": "medium"
}
```

Response:

```json
{
  "success": true,
  "caseId": "CASE123",
  "message": "Mystery generated successfully",
  "case": {
    "title": "The Missing Diamond",
    "story": "Investigation introduction...",
    "difficulty": "medium",
    "suspects": [],
    "clues": [],
    "evidence": [],
    "hintsRemaining": 3
  }
}
```

The response must not contain `culpritId` or `solutionExplanation`.

## 8.2 Retrieve Mystery

**Endpoint:** `GET /api/cases/:id`

Purpose:
- Retrieve an active case.
- Return story details.
- Return suspect profiles.
- Return evidence.
- Return discovered clue information.
- Return remaining hints.
- Return current investigation status.

Do not return secret solution fields.

## 8.3 Discover Clue

**Endpoint:** `POST /api/cases/:id/clues/:clueId/discover`

Request:

```json
{}
```

Purpose:
- Validate the clue ID.
- Verify the case is active.
- Record clue discovery.
- Prevent duplicate discovery.
- Return updated progress.

A discovered clue must only award points once.

## 8.4 Request Hint

**Endpoint:** `POST /api/cases/:id/hints`

Request:

```json
{}
```

Response:

```json
{
  "success": true,
  "hint": "Compare the access records with the suspect's alibi.",
  "hintsUsed": 1,
  "hintsRemaining": 2
}
```

The backend must reject requests when no hints remain.

## 8.5 Submit Accusation

**Endpoint:** `POST /api/cases/:id/accuse`

Request:

```json
{
  "suspectId": "S2"
}
```

Purpose:
- Validate the selected suspect.
- Verify the case is active.
- Compare the selected suspect with the hidden culprit.
- Calculate the score.
- Mark the case completed.
- Store the accusation.

Response:

```json
{
  "success": true,
  "result": {
    "correct": true,
    "accusedSuspect": "S2",
    "culprit": "S2",
    "score": 170,
    "baseScore": 150,
    "cluePoints": 30,
    "hintPenalty": 10,
    "explanation": "Complete mystery solution..."
  }
}
```

The result response is the first response allowed to reveal the culprit and solution.

## 8.6 Retrieve Result

**Endpoint:** `GET /api/cases/:id/result`

Purpose:
- Retrieve a completed investigation result.
- Return verdict.
- Return culprit.
- Return explanation.
- Return score breakdown.

If the case is still active, return an appropriate error without exposing the solution.

---

# 9. GEMINI AI INTEGRATION

## 9.1 Integration Architecture

Gemini must be integrated exclusively through the backend.

Use the official Google GenAI JavaScript SDK:

`@google/genai`

Create a dedicated service named `geminiService.js`.

Responsibilities:
- Initialize Gemini using the backend API key.
- Send mystery generation prompts.
- Request structured JSON output.
- Handle API errors.
- Parse model responses.
- Return generated data to the mystery validation layer.

The Gemini model name must be configurable through an environment variable.

## 9.2 Mystery Generation Prompt Requirements

The backend must construct a detailed prompt containing:

1. User-provided mystery premise.
2. Selected difficulty.
3. Required suspect count.
4. Required clue count.
5. Required hint count.
6. Required evidence formats.
7. Logical consistency requirements.
8. Hidden culprit and solution requirements.
9. Output JSON schema.

Gemini must generate a complete fictional investigation.

## 9.3 AI Output Structure

The expected internal AI response:

```json
{
  "title": "The Missing Diamond",
  "story": "A diamond disappeared during a hotel party...",
  "incidentDescription": "The incident details...",
  "suspects": [],
  "clues": [],
  "evidence": [],
  "hints": [],
  "culpritId": "S2",
  "solutionExplanation": "The complete solution...",
  "reasoning": {
    "motive": "The culprit's motive",
    "opportunity": "How the culprit committed the incident",
    "evidenceConnections": [
      "Clue C1 establishes...",
      "Clue C2 contradicts..."
    ]
  }
}
```

This is an internal backend response. Secret fields must never be sent to the frontend during an active investigation.

## 9.4 AI Logical Consistency Requirements

The generated mystery must satisfy these rules:

- Exactly one culprit must exist.
- The culprit must be one of the generated suspects.
- All suspect IDs must be unique.
- All clue IDs must be unique.
- All evidence IDs must be unique.
- All clue references must point to existing evidence.
- The solution must be supported by available clues.
- The culprit must have a believable motive and opportunity.
- At least two independent pieces of evidence should support the solution.
- Red herrings may exist but must not make the correct solution impossible.
- Suspect alibis and timestamps must not contradict the final explanation.
- Hints must guide investigation without directly naming the culprit.
- The mystery must have exactly the requested number of suspects, clues, and hints.

## 9.5 Validation and Regeneration

Never trust Gemini output directly.

The backend must:

1. Parse the response.
2. Validate it against the expected Zod schema.
3. Verify difficulty-specific counts.
4. Verify all ID references.
5. Verify the culprit belongs to the suspect list.
6. Check the evidence-to-clue relationships.
7. Check logical consistency rules.
8. Save the mystery only after validation succeeds.

If validation fails:
- Retry generation with corrective instructions.
- Allow a maximum of two generation attempts after the initial attempt.
- If all attempts fail, return a clear error.
- Do not store an invalid mystery.

Do not use frontend code to validate the hidden solution.

---

# 10. SECURITY REQUIREMENTS

Security is a mandatory part of this application.

1. Gemini API keys must remain in backend environment variables.
2. MongoDB credentials must never be exposed to the frontend.
3. Validate and sanitize all user inputs.
4. Validate all case IDs, suspect IDs, clue IDs, and difficulty values.
5. Do not expose the culprit ID during active gameplay.
6. Do not expose the solution explanation before the accusation.
7. Calculate scores only on the backend.
8. Prevent duplicate clue rewards.
9. Prevent hints beyond the allowed limit.
10. Prevent multiple final accusations.
11. Prevent operations on completed cases.
12. Configure CORS to allow the approved frontend origin.
13. Use safe error responses without leaking secrets or stack traces.
14. Add request rate limiting to prevent excessive mystery-generation requests.
15. Never execute AI-generated code or arbitrary commands.

**Critical rule:** Hiding the culprit in the React interface is not sufficient. The backend must never include the secret solution in any active-case API response.

For the MVP, anonymous case IDs can be used. Add a random, unguessable case access token for private case access, store only its hash on the backend, and require it for case operations. Do not rely on a sequential MongoDB ID alone as authorization.

---

# 11. NON-FUNCTIONAL REQUIREMENTS

## 11.1 Performance

- Home page should load quickly.
- API responses should be asynchronous.
- Display loading indicators during AI generation.
- Avoid unnecessary repeated API calls.
- Use efficient MongoDB queries.
- Load evidence details when needed.
- Handle slow Gemini responses without freezing the UI.

## 11.2 Responsiveness

The application must support:

- Desktop screens.
- Laptops.
- Tablets.
- Mobile phones.

All pages must adapt to different screen sizes.

## 11.3 Reliability

- Handle Gemini API failures.
- Handle MongoDB connection failures.
- Handle invalid AI output.
- Handle network errors.
- Prevent duplicate requests.
- Preserve investigation progress in MongoDB.

## 11.4 Usability

- Simple navigation.
- Clear instructions.
- Consistent visual styling.
- Readable evidence.
- Clear suspect selection.
- Understandable scoring.
- Helpful error messages.

---

# 12. ERROR HANDLING

The application must handle the following situations.

| Situation | Expected Behavior |
|---|---|
| Empty premise | Display validation message |
| Premise too short | Request at least 20 characters |
| Invalid difficulty | Reject request |
| Gemini API failure | Display generation failure message |
| Invalid Gemini JSON | Retry generation |
| MongoDB unavailable | Display temporary server error |
| Invalid case ID | Return 404 |
| Invalid clue ID | Return 404 |
| Clue already discovered | Return existing progress without awarding points again |
| No hints remaining | Display hint limit message |
| Invalid suspect selection | Reject accusation |
| Repeated accusation | Reject completed-case modification |
| Case already completed | Allow result retrieval only |
| Network failure | Display retry option where safe |

All API errors must follow a consistent format:

```json
{
  "success": false,
  "message": "Unable to process the request.",
  "errorCode": "REQUEST_FAILED"
}
```

Do not send internal Gemini prompts, API keys, or stack traces to the client.

---

# 13. ENVIRONMENT CONFIGURATION

## Backend `.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

The model value must be configured using a currently supported Gemini model available to the project.

## Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Frontend environment variables must never contain private API keys or database credentials.

Add `.env` files to `.gitignore`.

Provide `.env.example` files containing placeholder values for repository setup.

---

# 14. TESTING REQUIREMENTS

The following test cases must be completed before deployment.

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC01 | Open home page | Home page loads successfully |
| TC02 | Submit empty premise | Validation message appears |
| TC03 | Enter valid premise | Mystery generation starts |
| TC04 | Generate Easy mystery | 3 suspects, 5 clues, 2 hints |
| TC05 | Generate Medium mystery | 4 suspects, 7 clues, 3 hints |
| TC06 | Generate Hard mystery | 5 suspects, 9 clues, 3 hints |
| TC07 | Examine suspect | Correct profile is displayed |
| TC08 | Discover a clue | Progress updates |
| TC09 | Discover same clue twice | No duplicate points |
| TC10 | Request a hint | Hint is displayed and deducted |
| TC11 | Exceed hint limit | Request is rejected |
| TC12 | Correct accusation | Correct verdict and score |
| TC13 | Incorrect accusation | Score is zero |
| TC14 | Check active API response | Culprit remains hidden |
| TC15 | Submit accusation twice | Second submission is rejected |
| TC16 | Retrieve completed result | Correct result is displayed |
| TC17 | Gemini failure | Graceful error handling |
| TC18 | Mobile browser | Responsive layout works |

---

# 15. DEPLOYMENT REQUIREMENTS

The application must be deployed using:

| Component | Hosting |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| AI | Google Gemini API |

Deployment process:

1. Push the project to GitHub.
2. Configure MongoDB Atlas.
3. Deploy the Express backend to Render.
4. Add backend environment variables.
5. Deploy the React frontend to Vercel.
6. Configure the frontend API URL.
7. Configure production CORS.
8. Test the complete mystery generation workflow.
9. Test evidence discovery and hint functionality.
10. Test accusations and scoring.
11. Verify that the hidden solution is protected.
12. Test the application on mobile and desktop.

The application must work using the deployed website, not just localhost.

---

# 16. PROJECT SCOPE

## 16.1 MVP — Mandatory Features

The first complete version must include:

- Home page.
- Mystery premise input.
- Three difficulty levels.
- Gemini-powered mystery generation.
- Suspect generation.
- WhatsApp-style fictional conversations.
- AI-generated or clearly labeled placeholder photographic evidence.
- Simulated CCTV investigation evidence.
- Document and witness evidence.
- Clue discovery.
- Hint system.
- Final accusation.
- Backend scoring.
- Results and solution explanation.
- MongoDB persistence.
- Responsive design.
- Deployment.

## 16.2 Optional Future Enhancements

These features must not delay completion of the MVP:

- Actual AI-generated CCTV video clips.
- AI voice-based witness interrogation.
- Real-time multiplayer investigation.
- User registration and login.
- Leaderboards.
- Investigation history dashboard.
- Multiple mystery genres.
- Downloadable case reports.
- Timed investigation challenges.
- Advanced animations and sound effects.

---

# 17. ACCEPTANCE CRITERIA

The project will be considered complete only when all the following conditions are satisfied.

1. Users can enter their own mystery premises.
2. Users can generate Easy, Medium, and Hard mysteries.
3. Gemini generates valid and logically consistent investigations.
4. Each difficulty has the exact required suspect, clue, and hint counts.
5. Users can explore suspect profiles.
6. Users can examine multiple evidence formats.
7. Users can discover clues.
8. Users can request hints within the allowed limit.
9. Users can submit one final accusation.
10. The backend correctly validates the accusation.
11. The backend calculates the correct score.
12. The actual culprit is not exposed before the accusation.
13. The result page displays the culprit and complete explanation.
14. Investigation progress persists in MongoDB.
15. All important error cases are handled.
16. The website works on mobile and desktop.
17. The application is deployed and fully functional.

---

# 18. CODEX DEVELOPMENT INSTRUCTIONS

This section defines how Codex must work on the project.

## 18.1 Source of Truth

This `SPEC.md` is the single source of truth for the application.

Codex must follow this document when creating, modifying, or extending the project.

Do not introduce features or technologies that conflict with the specification without explicit approval.

## 18.2 Development Rules

1. Read the complete `SPEC.md` before writing code.
2. Understand the architecture before implementing features.
3. Follow the defined folder structure.
4. Use the specified MERN stack and Gemini API.
5. Maintain separation between frontend, backend, database, and AI services.
6. Never expose backend secrets.
7. Follow the API contracts defined in this document.
8. Use reusable React components.
9. Write clean, readable, modular code.
10. Validate inputs and AI outputs.
11. Do not hardcode the mystery solution in the frontend.
12. Do not use mock data as a substitute for Gemini integration in the final implementation.
13. Do not leave mandatory MVP features as non-functional UI placeholders.
14. Test each feature before proceeding to the next.
15. Update this specification only when a project requirement is explicitly changed.

## 18.3 Recommended Implementation Order

Codex must build the application incrementally in the following order.

**Phase 1 — Project Setup**
- Create React + Vite frontend.
- Create Node.js + Express backend.
- Configure Tailwind CSS.
- Install dependencies.
- Configure environment variables.
- Set up Git ignore rules.

**Phase 2 — Database and Backend**
- Connect MongoDB Atlas.
- Create Mongoose Case model.
- Create Express routes and controllers.
- Implement request validation.
- Implement consistent error handling.

**Phase 3 — Gemini Integration**
- Configure Gemini API.
- Create mystery generation prompts.
- Generate structured JSON.
- Validate AI responses.
- Protect hidden solution fields.
- Save valid mysteries.

**Phase 4 — Frontend Development**
- Build Home page.
- Build Create Mystery page.
- Build loading interface.
- Build Investigation Room.
- Build Suspect Cards.
- Build Evidence Cards and detail views.
- Build Hint Panel.
- Build Accusation page.
- Build Results page.

**Phase 5 — Game Logic**
- Implement clue discovery.
- Implement hint deductions.
- Implement accusation validation.
- Implement backend scoring.
- Implement completed-case handling.

**Phase 6 — Integration and Testing**
- Connect all React pages to backend APIs.
- Test all difficulty levels.
- Test all evidence types.
- Test scoring.
- Test security.
- Test responsive behavior.
- Fix all critical errors.

**Phase 7 — Deployment**
- Push source code to GitHub.
- Deploy backend to Render.
- Deploy frontend to Vercel.
- Configure production environment variables.
- Test the live website.

## 18.4 Codex Response Expectations

At the end of each implementation phase, Codex must report:

- Files created.
- Features implemented.
- Dependencies installed.
- Commands required to run the application.
- Tests performed.
- Errors remaining.
- Next implementation phase.

Do not generate the entire project in one uncontrolled step. Implement and verify each phase before moving forward.

---

# 19. FINAL PROJECT DELIVERABLES

The final project must contain:

1. Complete React frontend source code.
2. Complete Express backend source code.
3. MongoDB database integration.
4. Gemini AI integration.
5. Functional investigation and scoring system.
6. Responsive website.
7. GitHub repository.
8. Live deployed website.
9. README with setup and execution instructions.
10. Final tested mystery-solving demonstration.

**FINAL PRODUCT VISION**

AI Mystery Room should provide an immersive detective experience where every investigation feels different. Users should be able to turn a simple story idea into a complete mystery, investigate AI-generated evidence, identify inconsistencies, and uncover the culprit through logical reasoning.

The final application must be functional, visually polished, secure, and fully driven by AI-generated fictional investigations.

---

**END OF SPECIFICATION**

**Document Version:** 1.0  
**Project:** AI Mystery Room  
**Primary Development Reference:** SPEC.md  
**AI Coding Assistant:** OpenAI Codex
