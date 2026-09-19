# Security

Threat model:
- SSRF via submitted URLs
- malicious article HTML
- XSS
- auth bypass
- rate abuse
- injection
- secret leakage

URL fetching is a high-risk boundary and must validate protocol, destination IP, redirects, DNS, response size, and timeout.
