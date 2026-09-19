# Fake News Verifier — Claude Project Rules

## Mission
Build a production-oriented application that accepts a news headline, URL, or article text and returns an explainable, evidence-based credibility assessment.

The system must return:
- credibility score: 0–100
- classification
- confidence
- explanation
- supporting evidence
- contradicting evidence
- sources
- detected signals
- verification timestamp

Do not present an AI assessment as absolute truth. Prefer language such as "Evidence suggests", "The claim appears", and "Insufficient evidence".

## Architecture
Monorepo:
apps/api
apps/web-react
apps/web-vue
packages/shared-types
packages/api-client
packages/config
database
tests
docs
scripts

React is the primary user-facing application. Vue is the admin/analytics application. Do not duplicate business logic; share contracts and types.

## Stack
Backend:
- ASP.NET Core / C#
- Entity Framework Core
- PostgreSQL or SQL Server
- REST API
- JWT authentication
- FluentValidation
- Serilog
- OpenAPI/Swagger

React:
- React + TypeScript + Vite
- React Router
- TanStack Query
- Chart.js

Vue:
- Vue 3 + TypeScript + Vite
- Vue Router
- Pinia
- Chart.js

## Verification Pipeline
Input → Validation → Normalization → Claim Extraction → Article Retrieval → Source Discovery → Evidence Collection → Evidence Classification → Deterministic Credibility Scoring → Explanation → Persistence → API Response.

Each stage must be independently testable.

## Scoring
The score is 0–100 and must be deterministic for a given evidence set.

Use multiple signals such as:
- source reliability
- evidence strength
- source independence
- cross-source agreement
- contradiction
- recency
- claim specificity

Do not let an LLM directly decide the final score. The LLM may produce structured signals; a deterministic scoring engine calculates the final score.

Suggested interpretation:
0–19 Extremely Low Evidence
20–39 Low Evidence
40–59 Uncertain
60–79 Relatively Supported
80–100 Strongly Supported

These labels describe the evidence state, not objective truth.

## AI Rules
Never fabricate:
- sources
- URLs
- quotations
- statistics
- publication dates
- evidence

Use structured, schema-validated AI output. Unknown information must remain unknown.

If an external AI provider is unavailable, implement a local mock provider behind an interface so the project remains runnable.

## Evidence Rules
Evidence categories:
SUPPORTING
CONTRADICTING
NEUTRAL
INSUFFICIENT

Prefer primary sources, official records, academic/research sources, reputable independent reporting, and independent corroboration.

Do not treat search ranking, social engagement, or domain appearance alone as proof.

## Security
All external input is untrusted.

URL fetching MUST protect against:
- SSRF
- localhost
- private IP ranges
- cloud metadata endpoints
- file:// and unsupported protocols
- redirect abuse
- internal DNS resolution

Also implement input validation, authentication, authorization, rate limiting, request limits, secure headers, CORS, and secret management.

Never log passwords, tokens, or API keys.

## API
Use REST conventions and versioning:
POST /api/v1/verifications
GET /api/v1/verifications/{id}
GET /api/v1/verifications
POST /api/v1/articles/extract
GET /api/v1/sources/{id}
GET /api/v1/statistics

Use DTOs, validation, pagination, filtering, sorting, correlation IDs, and consistent errors. Never expose EF entities directly.

## Database
Core entities may include:
User
Verification
Claim
Article
Evidence
Source
VerificationEvidence
ScoreBreakdown
VerificationHistory

Use migrations and justified indexes.

## Frontend UX
Main flow:
Submit headline/URL → Verify → Score → Explanation → Evidence → Sources → History.

Use Chart.js for meaningful visualizations such as score breakdown, evidence distribution, source analysis, and verification history. Do not add decorative charts.

## Testing
Backend: unit + integration + API tests.
Frontend: component + hook/composable tests.
E2E: submit → verify → display score/evidence → save history.
Security-sensitive behavior must be tested.

## Workflow
For every major task:
1. Inspect repository.
2. Read relevant docs.
3. Identify dependencies.
4. Implement.
5. Add tests.
6. Run lint.
7. Run type-check.
8. Run tests.
9. Run build.
10. Review security.
11. Update docs.
12. Report exact results.

Do not rewrite working code unnecessarily.

## Definition of Done
A feature is complete only when implementation, validation, tests, lint/type-check/build, relevant documentation, and security review are complete.

## Autonomous Execution
When asked to build the whole project, continue through:
Analyze → Plan → Scaffold → Implement → Test → Fix → Review → Build → Document.

Do not stop after architecture/scaffolding.

Do not ask for confirmation for routine non-destructive implementation steps. Stop only when human authorization, an unavailable required external dependency, or a genuinely destructive action is required.

Never claim a command passed unless it was actually executed.
