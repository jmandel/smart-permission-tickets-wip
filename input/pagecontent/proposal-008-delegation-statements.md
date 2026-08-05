{% include callouts.html %}

**Status:** Draft for discussion \| **Author:** Josh Mandel \| **Date:** August 5, 2026

### Summary

A presenter-bound ticket cannot today be handed off: only the bound client can redeem it. This proposal lets an issuer mark a ticket delegable, and lets the bound presenter authorize a delegate by signing a **delegation statement** — a small JWT naming the delegate with the same `presenter_binding` structure the base specification already defines. The delegate redeems the original ticket unchanged, presenting the statement alongside it in the token-exchange slot RFC 8693 defines for exactly this purpose.

### Motivation

Tickets are often addressed to an organization that does its work through others: a health plan delegates risk to a provider group, or engages a contractor that runs the follow-up queries for a CRD transaction. The issuer wants to authorize "this plan or its delegates" without enumerating the delegates at mint time — the plan knows its delegates; the issuer need not.

A tangible test case: a payer (e.g., SCAN Health Plan) delegating to a risk-bearing provider group (e.g., Providence in Southern California), with trust bootstrapped by a network such as TEFCA and access constrained by the ticket.

### Design

**Opting in.** A ticket carries top-level `"delegable": true`. This is meaningful only on presenter-bound tickets — an unbound ticket is already redeemable by any audience-eligible client.

**The delegation statement.** A JWT signed by the ticket's bound presenter:

```json
{
  "ticket_iss": "https://tickets.issuer.example.org",
  "ticket_jti": "ticket-123",
  "presenter_binding": { "method": "jkt", "jkt": "<delegate key thumbprint>" },
  "access": { "smart_scopes": ["patient/Observation.rs"] },
  "exp": 1780160400,
  "jti": "delegation-456"
}
```

- `ticket_iss` and `ticket_jti` name the source ticket — the same identity revocation uses. The ticket is not embedded.
- `presenter_binding` names the delegate, reusing the base claim's structure (single binding or array).
- `access`, when present, narrows the grant. A statement can only narrow, never broaden.
- For a `jkt`-bound ticket, the statement's JOSE header carries the signing JWK and the Data Holder confirms its RFC 7638 thumbprint matches the ticket's binding. For a framework-bound ticket, the Data Holder validates the signer's identity under the named framework the same way it would have validated a presenting client.

**Presentation.** RFC 8693 token exchange already provides two slots with the right semantics. `subject_token` represents the party on whose behalf the request is made — that remains the Permission Ticket, unchanged. `actor_token` represents the identity of the acting party — that carries the delegation statement, with `actor_token_type` set to `https://smarthealthit.org/token-type/delegation-statement`. Delegation is the use case RFC 8693 defines this pairing (and the `act` claim) for, so no new transport machinery is needed.

**Verification.** The Data Holder:

1. Validates the ticket exactly as in the base specification, revocation included.
2. Finds the authenticated client does not satisfy the ticket's `presenter_binding`. If the ticket is `delegable` and an actor token is present, it continues; otherwise it rejects.
3. Verifies the statement's signature against the ticket's bound presenter, matches `ticket_iss` and `ticket_jti`, and confirms the statement is unexpired.
4. Confirms the authenticated client satisfies the statement's `presenter_binding`.
5. Computes the effective grant as the intersection of the ticket's grant and the statement's `access`, when present. The issued token MAY carry an `act` claim identifying the delegate, per RFC 8693.

**Depth 1.** A delegate cannot re-delegate: a delegation statement cannot authorize a further statement. Chains, depth limits, and re-delegation controls are out of scope until a concrete case needs them.

**Revocation.** Because the delegate redeems the original ticket, revoking the ticket reaches every delegation with no extra machinery. A delegator limits a statement's life with its `exp`.

### Relationship to the Base Specification

Nothing here is base conformance. The `delegable` claim, the delegation-statement format, and the actor-token presentation live in this proposal until adopted by the base or a ticket-type profile.
