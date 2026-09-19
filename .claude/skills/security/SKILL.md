# Security Skill

Review all external input.

For URL fetching:
- allow only http/https
- reject localhost and private ranges
- validate every redirect
- protect against DNS rebinding
- limit response size/time
- never access file:// or internal protocols

For API:
- validate input
- enforce authorization
- rate-limit expensive operations
- avoid sensitive logs
- secure secrets
