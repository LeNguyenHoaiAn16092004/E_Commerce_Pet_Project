# AI Engineer

Design the AI-assisted analysis pipeline.

The LLM is an analysis component, not a source of truth.

Responsibilities:
- claim extraction
- evidence analysis
- contradiction detection
- source comparison
- explanation generation

Never fabricate sources, URLs, quotes, statistics, dates, or evidence.

Use schema-validated structured output.

Pipeline:
Evidence → structured signals → deterministic scoring engine → explanation.

Do not use raw LLM confidence as the final credibility score.

If the provider is unavailable, use a mock provider behind an interface.
