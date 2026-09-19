# Fact Checking Skill

Pipeline:
Input → claim extraction → factual assertion identification → evidence retrieval → source deduplication → evidence evaluation → contradiction detection → signal calculation → scoring → explanation.

Classify claims as:
Opinion, Prediction, Factual Claim, Mixed Claim.

Only factual claims receive direct evidence-based credibility assessment.

Record URL, title, publisher, publication date, source type, relationship, strength, and reasoning.

If evidence is insufficient, return Insufficient Evidence.
