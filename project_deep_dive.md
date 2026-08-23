# ContentPulse: Comprehensive Technical Deep Dive

This document serves as your complete study guide and technical reference for the **ContentPulse** project. It explains the *Why, What, and How* of the entire system, detailing the architecture, AI logic, database structure, and key files so you can confidently explain your project in any technical interview.

---

## 1. The "Why" and "What" of the Project

### What is ContentPulse?
ContentPulse is an enterprise-grade AI platform that analyzes, scores, and rewrites social media content. It doesn't just use basic ChatGPT prompts; it uses advanced mathematical heuristics (for offline scoring) and **Retrieval-Augmented Generation (RAG)** to rewrite posts in a specific brand's tone.

### Why was it built this way?
Most AI wrappers are fragile. If OpenAI goes down or rate-limits the user, the app breaks. ContentPulse is built for **resilience and production readiness**:
1. **Multi-tier AI Fallback:** If one AI fails, it instantly switches to another. If all internet AIs fail, it falls back to local math-based rules.
2. **RAG Tone Matching:** Generic AI sounds robotic. By storing vector embeddings of your past posts in Supabase, the AI learns your exact writing style.
3. **Automated CI/CD Deployment:** Designed to be hosted on Vercel and Render with zero-downtime updates and dynamic CORS security.

---

## 2. High-Level Architecture (The "How")

The project is split into three main layers:
1. **Frontend (Client):** React 18, Vite, TypeScript, Zustand (State Management).
2. **Backend (Server):** Node.js, Express, TypeScript.
3. **Database & Storage:** Supabase (PostgreSQL) with `pgvector` for AI embeddings.

### How Data Flows (Example: Rewriting a Post)
1. **User** clicks "Rewrite" on the Frontend.
2. **Frontend** sends a POST request to `/api/rewrite` with the drafted text and the selected Persona (brand voice).
3. **Backend** receives the request. It takes the drafted text and converts it into a mathematical vector (Embedding) using Google Gemini.
4. **Database (Supabase)** performs a "Cosine Similarity Search". It compares the draft's vector against all past saved posts for that Persona and returns the top 5 closest matches.
5. **AI Orchestrator** takes the draft + the 5 past matches and sends them to the primary LLM (Gemini Flash).
6. **Gemini** generates the rewritten text, imitating the style of the past matches.
7. **Backend** saves the new rewrite to Supabase and sends it back to the Frontend.

---

## 3. Backend Deep Dive (`/server`)

The backend is an Express API. It follows the **Controller-Service Architecture**, meaning routing, business logic, and database access are strictly separated for clean code.

### A. The Core Entry Points
- **`src/app.ts`**: The heart of the Express server.
  - *Key Code:* `app.use(cors({ origin: function(...) }))`
  - *Why:* This is the dynamic CORS policy we added. It inspects incoming requests (like from your Vercel frontend) and allows them dynamically, preventing "Network Errors" in deployment.
  - *Key Code:* `app.use('/api/*', ...routes)` connects the specific URLs to their routers.

- **`src/config/env.ts`**: Environment validation.
  - *Why:* Instead of using `process.env.SUPABASE_URL` everywhere, this file parses and validates all keys on startup. If a key is missing, the server crashes *immediately* with a clear error, rather than failing silently later.

### B. The AI Brain (`src/services/ai/`)
This is the most impressive part of your backend.

- **`aiOrchestrator.ts`**: The Traffic Controller.
  - *What it does:* It decides which AI model to use.
  - *Key Function:* `rewriteContent()` calls Gemini first. If Gemini throws an error (e.g., rate limit), the `catch` block trips the **Circuit Breaker** and cascades the request to Groq, and if Groq fails, it falls back to `localHeuristicsProvider.ts`.
  
- **`circuitBreaker.ts`**: The Safety Switch.
  - *What it does:* Prevents cascading failures. If an API is down, we shouldn't keep hammering it and waiting 10 seconds for a timeout every single time.
  - *How it works:* After 3 failures, it changes state to `OPEN`. For the next 60 seconds, it instantly rejects requests (skipping the broken API and going straight to the fallback) to give the broken API time to recover.

- **`geminiProvider.ts` & `groqProvider.ts`**: The Model Connectors.
  - *What they do:* Format the prompts and talk to the specific APIs. 
  - *Important Detail:* In Groq, we manually extract JSON using regex because the specific `groq/compound` model doesn't support native JSON mode.

### C. Controllers & Services
- **Controllers (e.g., `personaController.ts`)**: Handle the HTTP Request and Response. They extract the user ID, check for bad input, call the Service, and return `res.json()`.
- **Services (e.g., `rewriteService.ts`)**: Where the actual business logic lives.
  - *Key Function:* `rewriteService.rewrite()` is responsible for talking to the Database to fetch RAG tone examples, then talking to the `aiOrchestrator` to do the rewrite, and finally saving the result to the `rewrites` table.

### D. Security Middleware (`src/middleware/`)
- **`authMiddleware.ts`**:
  - *How it works:* Intercepts every request. Looks at the `Authorization: Bearer <token>` header. It uses the Supabase client to verify that the token is valid. If valid, it attaches `req.user` to the request so downstream controllers know who is making the request.

---

## 4. Database Deep Dive (Supabase)

Your database isn't just storing text; it's a vector database.

### The Tables
1. **`personas`**: Stores brand voices (e.g., "Sassy Tech Startup", "Professional CEO").
2. **`persona_embeddings`**: Stores chunks of text linked to a persona, along with their `vector` representation.
3. **`analyses`, `rewrites`, `benchmarks`**: Standard relational tables to store user history.

### The Magic: `match_persona_embeddings` (Stored Procedure)
- *Where it lives:* In your Supabase SQL migrations.
- *What it does:* It performs a mathematical operation called **Cosine Similarity**. 
- *Why:* When a user wants to rewrite a post, we don't want to send *all* their past posts to the AI (it would exceed token limits and cost too much). This SQL function compares the mathematical vector of the *new* draft against the vectors of the *old* posts, returning only the top 5 most stylistically relevant posts to use as examples.

---

## 5. Frontend Deep Dive (`/client`)

The frontend is a modern React Single Page Application (SPA).

### A. State Management (Zustand)
- **`src/store/authStore.ts`**: 
  - *Why:* Better than Redux. It holds the global state of the user. 
  - *How:* When the app loads, it calls `supabase.auth.getSession()` and updates the state. If the user logs in, every component in the app instantly knows.

### B. Routing (React Router)
- **`src/App.tsx`**: Defines the pages (`/analyze`, `/history`, `/settings`).
- **`AuthGuard.tsx`**: A wrapper component. If a user tries to access `/analyze` without being logged in, it intercepts them and redirects to `/login`.
- **`vercel.json`**: (The fix we added) Vercel is a static host. If a user hits refresh on `/analyze`, Vercel looks for a folder named "analyze" and throws a 404. The `vercel.json` file tells Vercel: "Route everything to `index.html` and let React Router handle the URLs."

### C. API Connectivity (`src/services/api.ts`)
- *What it does:* Creates an Axios instance that talks to the backend.
- *The Interceptor:* Before *any* request leaves the frontend, the `api.interceptors.request.use` function secretly injects the user's Supabase JWT token into the headers. This means you don't have to manually attach tokens inside your UI components.

### D. The UI Components (`src/components/`)
- **`AnalyzePage.tsx`**: The main dashboard. It uses a clean, state-driven approach where the UI updates instantly based on loading states.
- **`PersonaManager.tsx`**: Where users upload their past posts. When submitted, this sends the text to the backend to be "chunked" and embedded into vectors.

---

## 6. How to Explain This in an Interview

If an interviewer asks you about this project, hit these key selling points:

1. **"I didn't just build an API wrapper."** Emphasize the **AI Orchestrator** and **Circuit Breaker**. Explain how you built a system that falls back to local mathematical heuristics if the APIs go down, ensuring 100% uptime.
2. **"I implemented Vector RAG for tone matching."** Explain how basic AI sounds generic, so you used Supabase `pgvector` to store past posts and inject them into the LLM context via Cosine Similarity search.
3. **"I focused heavily on Production Reliability."** Mention how you separated the code into Controllers and Services, utilized strict TypeScript typing, and handled deployment edge cases like CORS preflight requests and SPA routing on Vercel.

By understanding these components, you demonstrate knowledge of both advanced AI engineering and robust, enterprise-level web development.
