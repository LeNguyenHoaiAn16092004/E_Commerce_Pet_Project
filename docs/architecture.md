# Architecture

Monorepo:
apps/api
apps/web-react
apps/web-vue
packages/shared-types
packages/api-client
packages/config
database
tests

Runtime:
React/Vue → ASP.NET Core API → verification pipeline → deterministic scoring → persistence.

AI is used for structured analysis, not as the final scoring authority.
