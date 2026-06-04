{% include callouts.html %}

**Status:** Draft for discussion \| **Author:** Josh Mandel \| **Date:** June 4, 2026

### Summary

The base specification defines ticket redemption for local access token issuance. It does not define portable continuation credentials and does not require Data Holders to issue refresh tokens after ticket redemption.

This proposal defines an optional top-level `continuation` claim that lets an issuer bound the continuation credentials (such as refresh tokens) a Data Holder may derive from a successful ticket redemption. It addresses scenarios where access should outlive a single session without requiring the client to re-present the ticket for every token refresh.

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

A third pattern — the Data Holder issuing a local refresh token derived from an accepted ticket — is common OAuth practice but raises questions the base specification deliberately does not answer: how long may derived credentials live, and how does ticket revocation reach them? This proposal answers those questions with an explicit, issuer-controlled bound.

### Roles of the Three Credentials

Permission Tickets, access tokens, and refresh tokens play distinct roles:

* A **Permission Ticket** is the portable, issuer-signed authorization grant.
* A **Data Holder access token** is the short-lived local bearer token issued after successful ticket redemption.
* A **Data Holder refresh token**, if issued, is a local continuation credential derived from that accepted grant.

### Design Goals

- Preserve the meaning of ticket `exp`: expiration controls when the ticket can be used for new token exchange redemption.
- Preserve issuer intent: Data Holders do not create longer-lived access unless the ticket permits it.
- Keep derived credentials bounded: a local refresh token can narrow access but cannot broaden the effective grant.
- Keep the stateless path simple: re-presenting a valid, unrevoked, presenter-bound ticket remains the baseline way to obtain fresh short-lived access tokens.
- Allow Data Holder optimization: local refresh tokens remain available for rotation, replay detection, cached patient matching, and other local session-management needs.
- Keep revocation effective: long-lived continuation cannot bypass ticket revocation.
- Keep the protocol small: the ticket states continuation limits; it does not define a portable refresh-token format or a second authorization artifact.

### Proposal: the `continuation` Claim

This proposal defines an optional top-level `continuation` claim in the Permission Ticket claims set. The claim bounds Data Holder-issued continuation credentials:

```json
{
  "exp": 1777478400,
  "jti": "ticket-123",
  "continuation": {
    "refresh_token": {
      "allowed": true,
      "not_after": 1780160400,
      "revocation_check": "required"
    }
  }
}
```

Draft requirements:

- If `continuation` is absent, Data Holders SHALL NOT issue refresh tokens that remain usable after the ticket's `exp`.
- If `continuation.refresh_token.allowed` is `true`, a Data Holder MAY issue a refresh token derived from successful ticket redemption.
- A derived refresh token SHALL NOT authorize access broader than the effective grant computed from the ticket, requested scopes, client registration, and local policy.
- A derived refresh token SHALL NOT be honored after `continuation.refresh_token.not_after`.
- If `continuation.refresh_token.revocation_check` is `required`, the Data Holder SHALL check the source ticket's revocation status before honoring the derived refresh token.
- When a ticket permits derived refresh tokens beyond ticket `exp`, the ticket's revocation status remains authoritative for those derived refresh tokens until `continuation.refresh_token.not_after`.
- Issuers that permit continuation beyond `exp` SHALL maintain ticket revocation status until at least `continuation.refresh_token.not_after`.

### Relationship to the Base Specification

The base specification states only that Data Holders are not required to issue refresh tokens after ticket redemption, and that any local continuation credential SHALL NOT authorize broader access than the effective grant computed at redemption time. Everything beyond that — the `continuation` claim, its lifetime bound, and its revocation linkage — lives in this proposal and is not part of base conformance unless adopted by the base or by a ticket-type profile.

### Open Questions

> **Open Question (OQ-P4A): Adoption Path.** Should the `continuation` claim be promoted into the base claims set once implementations validate it, or should it remain a composable extension that individual ticket-type profiles or trust frameworks adopt?
{: .callout .callout-open-question #oq-p4a}
