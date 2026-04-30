{% include callouts.html %}

**Status:** Draft for discussion \| **Author:** Josh Mandel \| **Date:** April 17, 2026

### Summary

Current spec treats ticket issuance — how a client actually obtains a Permission Ticket from a trusted issuer — as out of scope. This proposal fills that gap with a concrete, deployable kickoff: the client performs a standard SMART App Launch against the issuer's SMART on FHIR endpoint, and the resulting token response carries an array of freshly minted Permission Tickets alongside a list of FHIR endpoint hints where the network expects those tickets to be usable.

By reusing SMART App Launch verbatim, every conformant SMART client already knows how to start the flow, and every issuer already has the building blocks (authorize endpoint, token endpoint, discovery document, consent UX) to operate as a ticket minter.

### Motivation

The main specification leaves "how does the client get the ticket" unspecified. In deployment, this is the first thing every implementer asks. Prior working-group discussion considered several kickoff mechanisms (custom REST endpoints, CDS Hooks-style cards, pre-issued JWTs delivered out of band). Each requires new client code.

SMART App Launch is already the universal authorization kickoff in the SMART ecosystem:

- Every SMART client knows how to discover `.well-known/smart-configuration`, run an authorization code flow with PKCE, and parse a token response.
- Every SMART-capable server already knows how to run a consent UX, authenticate a user, and return an access token.
- Identity proofing, multi-factor auth, delegation capture, sensitive-data preferences — all the hard UX that an issuer needs to run before minting a ticket — map cleanly onto an authorization flow that a patient (or other authorizing party) already understands.

An issuer that adopts this proposal becomes, from the client's perspective, a SMART on FHIR endpoint whose token response happens to carry Permission Tickets.

### Proposal

#### 1. Issuer exposes a SMART on FHIR endpoint

A Permission Ticket issuer operating this kickoff SHALL publish a SMART configuration document at `${iss}/.well-known/smart-configuration` (the same base URL referenced by the ticket's `iss` claim). Clients discover the authorize and token endpoints by the standard SMART mechanism.

The issuer's SMART configuration adds two fields:

```json
{
  "authorization_endpoint": "https://issuer.example.org/authorize",
  "token_endpoint": "https://issuer.example.org/token",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "scopes_supported": ["openid", "fhirUser", "permission_ticket", "offline_access"],
  "code_challenge_methods_supported": ["S256"],
  "capabilities": ["launch-standalone", "permission-ticket-issuance"],

  "smart_permission_ticket_issuer": true,
  "smart_permission_ticket_types_issued": [
    "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
    "https://smarthealthit.org/permission-ticket-type/patient-delegated-access-v1"
  ]
}
```

| Field | Description |
|---|---|
| `smart_permission_ticket_issuer` | Boolean flag. When `true`, the server issues Permission Tickets in its token response. |
| `smart_permission_ticket_types_issued` | Array of `ticket_type` URIs this issuer mints. Clients use this to select issuers that cover their use case. |
| `capabilities` | SHALL include `permission-ticket-issuance` alongside standard SMART capabilities. |

Nothing else about the SMART configuration is special. Scope registration, PKCE, client authentication, and refresh tokens all follow SMART App Launch.

#### 2. Client initiates standalone SMART launch

The client runs a standard standalone launch against the issuer's authorize endpoint:

```
GET /authorize?
  response_type=code
  &client_id=well-known:https://app.example.com
  &redirect_uri=https://app.example.com/callback
  &scope=openid+fhirUser+permission_ticket+patient/Observation.rs+patient/Condition.rs+offline_access
  &aud=https://issuer.example.org
  &state=xyz
  &code_challenge=...
  &code_challenge_method=S256
```

The client includes:

- `permission_ticket` — a new marker scope indicating that the client expects Permission Tickets in the token response. An issuer that does not mint tickets for this client (e.g., the user declined, or the requested ticket type is unsupported) SHALL NOT include this scope in the granted `scope` value.
- **Desired SMART scopes for the ticket(s)** — e.g., `patient/Observation.rs`. These are the scopes the client wants the resulting tickets to authorize at Data Holders, not scopes used at the issuer itself. The issuer's consent UX frames them to the user as the sharing scope.
- `openid` and `fhirUser` if the client wants an `id_token` identifying the authorizing party.
- `offline_access` if the client wants a refresh token for later re-issuance.

#### 3. Issuer runs its consent UX and mints tickets

Between authorize and redirect, the issuer runs whatever real-world verification and consent UX it operates — identity proofing via a digital ID wallet, delegation capture for UC2, sensitive-data handling preferences, and so on. This is the same UX the issuer would run under any other kickoff mechanism; SMART App Launch just wraps it.

At the end of consent, the issuer mints one or more Permission Tickets. The issuer chooses ticket `aud` and `data_holder_filter` based on the network it operates within and the user's selections. It chooses `ticket_type` based on the relationship expressed during consent (self-access vs delegation, and so on).

#### 4. Token response carries tickets and endpoint hints

The client exchanges the code at the issuer's token endpoint using PKCE and any configured client authentication. The token response extends the SMART token response with two new top-level fields:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "access_token": "eyJhbGciOiJFUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "8xLOxBtZp8",
  "scope": "openid fhirUser permission_ticket patient/Observation.rs patient/Condition.rs offline_access",
  "id_token": "eyJhbGciOiJFUzI1NiIs...",

  "smart_permission_ticket": [
    "eyJhbGciOiJFUzI1NiIs...TICKET_JWT_1...",
    "eyJhbGciOiJFUzI1NiIs...TICKET_JWT_2..."
  ],

  "smart_permission_ticket_endpoints": [
    {
      "fhir_base_url": "https://fhir.hospital-a.example.org",
      "organization": {
        "resourceType": "Organization",
        "name": "Hospital A",
        "identifier": [
          { "system": "http://hl7.org/fhir/sid/us-npi", "value": "1111111111" }
        ]
      },
      "ticket_indices": [0]
    },
    {
      "fhir_base_url": "https://fhir.clinic-b.example.org",
      "organization": {
        "resourceType": "Organization",
        "name": "Clinic B",
        "identifier": [
          { "system": "http://hl7.org/fhir/sid/us-npi", "value": "2222222222" }
        ]
      },
      "ticket_indices": [1]
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `smart_permission_ticket` | string[] | Array of signed Permission Ticket JWTs. SHALL be present when `permission_ticket` is in the granted `scope`. |
| `smart_permission_ticket_endpoints` | EndpointHint[] | Optional. Hints about where the network expects these tickets to work. |

Each `EndpointHint` has:

| Field | Description |
|---|---|
| `fhir_base_url` | FHIR base URL of a Data Holder. The client discovers that Data Holder's token endpoint via `${fhir_base_url}/.well-known/smart-configuration`. |
| `organization` | Optional FHIR `Organization` describing the Data Holder for UI display and matching. |
| `ticket_indices` | Optional array of zero-based indices into `smart_permission_ticket`, indicating which tickets the issuer expects to be redeemable at this endpoint. When absent, the client may try any ticket whose `aud` covers the endpoint. |

Endpoint hints are **advisory**. Final eligibility is determined at redemption time by the Data Holder's own validation (issuer trust, ticket `aud`, `data_holder_filter`, etc.). A client MAY also attempt redemption at endpoints not listed if the ticket's `aud` is a trust-framework identifier that covers them.

#### 5. Client redeems tickets at Data Holders

Once the client holds the tickets, it presents them at Data Holder token endpoints via RFC 8693 token exchange exactly as specified in the main specification. The Data Holder does not know or care that the tickets were obtained via SMART App Launch — from its perspective, each ticket is a signed JWT whose `iss` is a trusted issuer.

#### 6. Re-issuance via refresh token

When the client requested `offline_access`, the issuer's token response includes a refresh token. Presenting that refresh token at the issuer's token endpoint returns a new token response with a fresh `smart_permission_ticket` array. This lets long-lived clients rotate tickets without re-running the full consent UX. Refresh-token rotation, revocation, and lifetime follow standard OAuth behavior.

#### 7. Presenter binding

When the issuer registers the client with a known public key (e.g., a well-known JWKS), the issuer SHOULD set `presenter_binding` on the minted tickets:

- `jkt` — the client's JWK Thumbprint, if the issuer knows the exact client key it wants to bind against.
- `trust_framework_client` — when the client participates in a trust framework (well-known, UDAP, OIDF) and redemption should be open to any instance of that framework-recognized entity.

For patient access use cases (UC1/UC2), `presenter_binding` is REQUIRED per the main specification, so the issuer SHALL NOT mint an unbound UC1/UC2 ticket through this flow.

### Design Rationale

*Why SMART App Launch rather than a new custom issuance API?* Because the control flow for ticket issuance is not new. The issuer needs to authenticate a user, run consent, and return an authorization artifact — that is exactly what an authorization server does. Reusing SMART App Launch lets implementations keep the existing launch, redirect, and token exchange mechanics, while adding the ticket-specific behavior this proposal defines. The specification additions are limited to two discovery fields and two token response fields.

*Why put tickets in the token response rather than behind a separate fetch?* Because the access_token and the tickets represent the same authorization event and should be delivered atomically. A separate fetch would need its own auth, its own cache semantics, and its own failure modes — all for a value that is already known at token-issuance time.

*Why an array of tickets rather than one?* Because a single authorizing decision often needs to produce multiple tickets. Different Data Holders may need narrower `aud`, different `data_holder_filter`, or different lifetimes. Per the main spec's [Using Multiple Tickets](index.html#using-multiple-tickets) guidance, issuers SHOULD mint separate tickets when constraints vary. Returning an array matches how issuance actually works.

*Why endpoint hints at all?* Because issuers often know more about "where this ticket is likely to be tried" than the client does. A consumer-access issuer integrated with a payer directory knows which Data Holder endpoints cover the patient's known providers. Surfacing that knowledge lets the client go directly to those endpoints instead of brute-forcing a network discovery step. Hints are never authoritative — `aud` and Data Holder trust policy still decide at redemption.

*Why not reuse the SMART `patient` launch context parameter?* Because `subject.patient` in a Permission Ticket is issuer-attested for matching at a Data Holder, not a local patient reference at the issuer. Overloading the SMART `patient` launch parameter would confuse the two.

*Relationship to proposal 001 (authz code fallback).* Proposal 001 covers fallback **at redemption time** when a Data Holder cannot resolve the ticket silently. Proposal 003 covers kickoff **at issuance time** when a client first obtains the ticket. The two flows are independent and compose cleanly: a client runs proposal 003 once to get tickets from an issuer, then presents each ticket via token exchange; if any Data Holder needs interactive disambiguation, proposal 001 handles it there.

*Relationship to proposal 002 (OIDF issuers).* Proposal 002 covers how an issuer publishes its ticket-signing keys under OpenID Federation. Proposal 003 is agnostic to how the issuer's keys are published; a given issuer may use the baseline well-known JWKS, an OIDF federation chain, or both. The two proposals address orthogonal concerns.

### Open Questions

> **Open Question (OQ-3A): Scope Grammar for Requesting Tickets.** This proposal introduces a `permission_ticket` marker scope plus SMART v2 CRUDS scopes (e.g., `patient/Observation.rs`) to convey the desired ticket access. Alternatives considered: a single structured parameter (e.g., `ticket_request=<json>`) passed in the authorize request, or a `ticket_type`-prefixed scope form (e.g., `ticket:patient-self-access-v1:patient/Observation.rs`). The working group should decide whether the marker-scope plus CRUDS approach is expressive enough for the full range of ticket-type-specific constraints (e.g., UC3 `reportable_condition`, UC5 `claim` reference) or whether a structured parameter is needed for those cases.
{: .callout .callout-open-question #oq-3a}

> **Open Question (OQ-3B): Endpoint Hints Format.** This proposal models endpoint hints as objects with `fhir_base_url`, `organization`, and `ticket_indices`. An alternative is to reuse the SMART App State / SMART Brands `Endpoint` resource format directly, which is already structured for this purpose and may provide better interoperability with existing patient-facing app directories. A third alternative is to keep the hints out of the base proposal entirely and define them in a separate profile, on the grounds that issuers and clients can negotiate them out of band.
{: .callout .callout-open-question #oq-3b}

> **Open Question (OQ-3C): Issuer-Issued Access Token Utility.** The token response includes an `access_token` because that is the baseline SMART shape, but this proposal does not prescribe what that access token is useful for. Options: (a) it grants access to an issuer-operated FHIR endpoint that lets the client read back authorization state, consent artifacts, and audit records; (b) it authorizes refresh-token redemption only; (c) it is reserved for a future revision. Input welcome on whether issuer-side FHIR access is a real client need or an over-designed hypothetical.
{: .callout .callout-open-question #oq-3c}
