# Ticket Lifecycle

## Validity Period

- Tickets MUST include an `exp` (expiration) claim
- Data Holders MUST reject expired tickets
- Recommended validity periods:

| Use Case | Recommended `exp` |
|----------|-------------------|
| Interactive/real-time | 1-4 hours |
| Batch processing | 24 hours |
| Standing authorization | Up to 1 year (with revocation) |

## Long-Lived Access

For scenarios requiring access beyond a single session (e.g., ongoing care relationships, research studies), two approaches are supported:

### Approach 1: Refresh via Issuer

The client periodically obtains fresh tickets from the issuer. Suitable when:
- Issuer interaction is low-friction (automated, no user involvement)
- Access should be re-validated regularly

### Approach 2: Long-Lived Tickets with Revocation

The issuer mints a ticket with extended validity (weeks to months) and supports revocation. Suitable when:
- Issuer interaction is high-friction (e.g., in-person identity verification via Clear, notarized documents)
- Access may need to be terminated before natural expiration
- The cost of re-issuance (user time, verification fees) is prohibitive

## Revocation

Issuers MAY support revocation of individual tickets before expiration.

### Revocation Identifier

Tickets supporting revocation include a `revocation` claim:

```json
{
  "iss": "https://trust-broker.org",
  "sub": "https://app.example.com",
  "exp": 1735689600,
  "jti": "ticket-unique-id",
  "revocation": {
    "url": "https://trust-broker.org/.well-known/crl/patient-access.json",
    "rid": "abc123xyz"
  },
  "ticket_context": { ... }
}
```

| Field | Description |
|-------|-------------|
| `revocation.url` | URL of the issuer's Credential Revocation List (CRL) for this category of tickets |
| `revocation.rid` | Revocation identifier for this ticket. MUST be opaque (not contain PII). |

**Generating `rid`:** Issuers SHOULD use a one-way transformation to prevent correlation:
```
rid = base64url(hmac-sha-256(issuer_secret || kid, ticket_jti)[0:8])
```

The `rid` uses the base64url alphabet and SHOULD be no longer than 24 characters.

### Revocation List Format

The CRL is a JSON file served at the URL specified in the ticket:

```json
{
  "kid": "issuer-signing-key-id",
  "method": "rid",
  "ctr": 42,
  "rids": [
    "abc123xyz",
    "def456uvw.1710460800"
  ]
}
```

| Field | Description |
|-------|-------------|
| `kid` | Key ID used to sign tickets covered by this CRL |
| `method` | Revocation method identifier. Value `"rid"` indicates the method defined in this specification. |
| `ctr` | Monotonic counter incremented on each update. Verifiers use this to detect changes. |
| `rids` | Array of revoked `rid` values. Optional `.timestamp` suffix (Unix seconds) revokes only tickets issued before that time. |

**Timestamp Suffix Example:**

The entry `"def456uvw.1710460800"` revokes tickets with `rid` = `def456uvw` that were issued (`iat`) before March 15, 2024 00:00:00 UTC. Tickets with that `rid` issued after this timestamp remain valid.

This enables batch revocation (e.g., "revoke all tickets for this user issued before they revoked consent") without invalidating newly issued tickets.

### Revocation Checking

**Issuers:**
- MUST publish CRL at the URL specified in tickets
- MUST serve CRL over HTTPS
- MUST increment `ctr` on every update
- SHOULD include `ctr` in JWKS metadata to enable efficient cache invalidation

**Data Holders:**
- If `revocation` is present in ticket, SHOULD check the CRL
- MAY cache CRL responses respecting HTTP cache headers
- SHOULD re-fetch CRL when `ctr` changes (if discoverable) or periodically
- MUST reject tickets whose `rid` appears in the CRL (respecting timestamp suffix if present)
- If CRL is unavailable, MAY accept ticket (fail-open) or reject (fail-closed) per local policy

### Grouping for Privacy

Issuers MAY use multiple CRL URLs to group tickets by category:

```json
// Research study tickets
{ "revocation": { "url": "https://issuer.example/.well-known/crl/research.json", "rid": "..." } }

// Patient access tickets  
{ "revocation": { "url": "https://issuer.example/.well-known/crl/patient-access.json", "rid": "..." } }

// Provider referral tickets
{ "revocation": { "url": "https://issuer.example/.well-known/crl/referrals.json", "rid": "..." } }
```

This prevents correlation across ticket categories when checking revocation. A Data Holder processing a research ticket only sees the research CRL, not the patient access CRL.

### CRL Size Considerations

For high-volume issuers, CRL size may become a concern. Mitigations:

1. **Time-based partitioning**: Separate CRLs by issuance period (e.g., monthly)
2. **Short ticket lifetimes**: Expired tickets can be removed from CRL
3. **Bloom filters**: For very large lists, an additional bloom filter endpoint can enable efficient negative lookups

## Reusability

- Tickets are **reusable** until expiration (or revocation)
- Data Holders are NOT REQUIRED to enforce single-use semantics
- If single-use is required for a use case, the issuer should use very short expiration times
