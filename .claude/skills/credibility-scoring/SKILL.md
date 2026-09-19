# Credibility Scoring Skill

Input:
Claim + Evidence[] + SourceMetadata[].

Calculate structured signals:
- source reliability
- evidence strength
- source independence
- agreement
- contradiction penalty
- recency
- claim specificity

The final score must be deterministic, explainable, testable, and versioned.

Do not use raw LLM confidence as the final score.

Output:
score, classification, confidence, breakdown.

Every scoring change must update docs/credibility-scoring.md.
