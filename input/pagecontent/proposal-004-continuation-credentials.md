{% include callouts.html %}

**Status:** Adopted into the base specification (August 5, 2026) \| **Author:** Josh Mandel \| **Date:** June 4, 2026

### Summary

This proposal defined an optional top-level `continuation` claim that lets an issuer bound the continuation credentials (such as refresh tokens) a Data Holder may derive from a successful ticket redemption. It addresses scenarios where access should outlive a single session without requiring the client to re-present the ticket for every token refresh — in particular, letting Data Holders leverage their existing SMART on FHIR refresh-token infrastructure.

The claim has been adopted, in simplified form, into the base specification: see [Long-Lived Access and Continuation](index.html#long-lived-access-and-continuation). This page records the motivation and design history.

### Motivation

For scenarios requiring access beyond a single session (e.g., ongoing care relationships, research studies), two approaches work within the base specification alone:

**Approach 1: Refresh via Issuer**

The client periodically obtains fresh tickets from the issuer. Suitable when:
- Issuer interaction is low-friction (automated, no user involvement)
- Access should be re-validated regularly

**Approach 2: Long-Lived Tickets with Revocation**

The issuer mints a ticket with extended validity (weeks to months) and supports revocation. Suitable when:
- Issuer interaction is high-friction (e.g., in-person identity verification, notarized documents)
- Access may need to be terminated before natural expiration
- The cost of re-issuance (user time, verification fees) is prohibitive

A third pattern — the Data Holder issuing a local refresh token derived from an accepted ticket — is common OAuth practice but raises questions the base specification originally did not answer: how long may derived credentials live, and how does ticket revocation reach them? The adopted `continuation` claim answers those questions with an explicit, issuer-controlled bound. The distinction it draws is between the ticket's `exp` as the *enrollment window* for new redemptions and `continuation.refresh_until` as the duration of the established relationship.

### Roles of the Three Credentials

Permission Tickets, access tokens, and refresh tokens play distinct roles:

* A **Permission Ticket** is the portable, issuer-signed authorization grant.
* A **Data Holder access token** is the short-lived local bearer token issued after successful ticket redemption.
* A **Data Holder refresh token**, if issued, is a local continuation credential derived from that accepted grant.

### Simplification at Adoption

As drafted, the claim carried three fields:

```json
"continuation": {
  "refresh_token": {
    "allowed": true,
    "not_after": 1780160400,
    "revocation_check": "required"
  }
}
```

Only one carried information. Refresh tokens that die at or before ticket `exp` need no claim at all, so the claim's sole job is extending continuation past `exp` — and in that case the draft's own rules forced `revocation_check` to `"required"`, while `allowed` was implied by the object's presence. The adopted shape keeps the one load-bearing field:

```json
"continuation": { "refresh_until": 1780160400 }
```

with the revocation linkage stated as rules rather than a field with a single legal value.
