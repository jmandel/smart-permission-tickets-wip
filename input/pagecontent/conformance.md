# Conformance

This section defines requirements using RFC 2119 keywords (MUST, SHOULD, MAY).

## Data Holder Requirements

### MUST

- Accept `https://smarthealthit.org/permission_tickets` claim in client assertions
- Validate client assertion per SMART Backend Services
- For each ticket:
  - Verify signature using issuer's JWKS (fetched from `{iss}/.well-known/jwks.json`)
  - Verify `sub` matches the client assertion's `iss`/`sub`
  - Verify `aud` per audience validation rules
  - Verify `exp` is in the future
- Calculate granted scopes as intersection of requested, ticket capability, and client registration
- Return appropriate error codes on validation failure

### SHOULD

- Cache issuer JWKS with appropriate TTL (respecting HTTP cache headers)
- Log `ticket_context.actor` and `ticket_context.context` for audit trail
- Enforce `capability.periods` by filtering returned resources
- Enforce `capability.locations` by filtering to matching jurisdictions (state granularity)
- Enforce `capability.organizations` by filtering to matching sources
- Check revocation lists when `revocation` is present in ticket

### MAY

- Support trust framework audience validation (Mode 2)
- Support multiple tickets per use case profile
- Implement additional caching strategies for revocation lists
- Support `nbf` (not before) claim for delayed ticket activation

## Client Requirements

### MUST

- Include tickets as an array in `https://smarthealthit.org/permission_tickets` claim
- Sign client assertion with registered or federated key
- Use identical value for `iss` and `sub` in client assertion (the Client ID URL)

### SHOULD

- Request only scopes authorized by held tickets
- Include `jti` in client assertion for replay protection
- Refresh tickets before expiration for continued access

### MAY

- Present multiple tickets per a defined use case profile
- Include `trust_chain` in assertion header for automatic registration via OIDC Federation

## Issuer Requirements

### MUST

- Sign tickets with keys published at `{iss}/.well-known/jwks.json`
- Include claims: `iss`, `sub`, `aud`, `exp`, `ticket_context`
- Bind each ticket to a specific client via `sub`
- If supporting revocation: publish CRL at the URL specified in tickets

### SHOULD

- Include `jti` for unique ticket identification
- Verify client identity and authorization before minting tickets
- Use short expiration for interactive use cases (1-4 hours)
- Support revocation for long-lived tickets
- Use opaque `rid` values that do not leak PII
- Include `iat` (issued-at) claim

### MAY

- Support multiple CRL endpoints for privacy grouping
- Include `nbf` (not before) for delayed activation
- Include `ctr` (CRL counter) in JWKS metadata for efficient cache invalidation
