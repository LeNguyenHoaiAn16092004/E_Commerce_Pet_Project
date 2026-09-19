# Master Prompt — One Shot Project Build

Build the entire Fake News Verifier project according to CLAUDE.md.

Operate as the project orchestrator.

Execute:
1. Inspect repository.
2. Read CLAUDE.md and relevant docs.
3. Create an implementation plan.
4. Scaffold missing projects.
5. Implement backend.
6. Implement database and migrations.
7. Implement authentication/authorization.
8. Implement fact-checking pipeline.
9. Implement deterministic credibility scoring.
10. Implement AI-assisted structured analysis.
11. Implement React application.
12. Implement Vue admin/analytics application.
13. Implement shared contracts.
14. Implement Chart.js visualizations.
15. Implement security protections.
16. Implement unit/integration/E2E tests.
17. Configure Docker.
18. Create .env.example.
19. Update documentation.
20. Run lint, type-check, tests, and production builds.
21. Fix failures caused by the implementation.
22. Perform final security and architecture review.

Use specialized agents from .claude/agents when appropriate.

Rules:
- Inspect before modifying.
- Do not overwrite working code unnecessarily.
- Never fabricate evidence, citations, URLs, or test results.
- Never claim a command passed unless executed.
- Never trust user-provided URLs.
- Keep final scoring deterministic and explainable.
- Do not allow the LLM to directly determine the final score.
- If an external AI provider/key is unavailable, use a mock provider behind an interface so the project remains runnable.
- Continue autonomously through routine non-destructive implementation steps.

At the end report:
Implementation Summary
Files Created
Files Modified
Tests
Build Status
Security Review
Known Limitations
How To Run

Actually implement the project. Do not merely describe it.
