{% include callouts.html %}

This page tells you what to build, by role. It is non-normative; the [architecture page](index.html) governs. Read this first to scope the work, then implement against the normative sections it links to.

### If you operate a FHIR server (Data Holder)

You are adding one grant type to your existing SMART-on-FHIR token endpoint. No new endpoints, no user-facing screens.

1. **Accept token exchange.** Handle `grant_type=urn:ietf:params:oauth:grant-type:token-exchange` with a `subject_token_type` of `https://smarthealthit.org/token-type/permission-ticket`. Advertise both in `.well-known/smart-configuration`, along with the `ticket_type` URIs you accept. ([Transport](index.html#transport-token-exchange-rfc-8693))
2. **Authenticate the client** exactly as you already do for SMART Backend Services or UDAP. The ticket never replaces client authentication. ([Trust and Client Registration](index.html#trust-and-client-registration))
3. **Validate the ticket** through the pipeline: signature against the issuer's published JWKS, issuer trust for this ticket type, `exp`/`aud`, revocation check, presenter binding, identity evidence, access constraints (reject any you cannot enforce), subject resolution. Implement it as written — the step order matters for correct error responses. ([Server-Side Validation](index.html#server-side-validation))
4. **Resolve the subject** to one local patient record from `subject.patient` demographics, corroborated by identity evidence when present. Zero or multiple matches → reject with `invalid_grant`. ([Subject Resolution](index.html#subject-resolution))
5. **Issue a scoped access token**: the intersection of requested scopes, the ticket's `access`, client eligibility, ticket-type rules, and your own policy. Enforce `data_period` by applying each resource type's designated date search parameter as an implicit filter — searches your server already supports. ([Access Calculation](index.html#access-calculation), [Data Period Enforcement](access-constraints.html#data-period-enforcement))
6. **Configure trusted issuers** per ticket type. Trusting an issuer for patient self-access does not trust it for delegated access.

Start with patient self access: it has no requester, no profile claims, and a single policy question — can you match the patient. The [conformance section](index.html#data-holder-requirements) is your checklist, [Access Constraints](access-constraints.html) defines what you enforce, and the [signed examples](use-case-catalog.html) are your test vectors.

### If you want to mint tickets (Issuer)

You verify real-world facts and sign a JWT. The Data Holder relies on your verification, so most requirements are about what you do before signing.

1. **Publish keys** at `{iss}/.well-known/jwks.json`. ([Issuer Key Publication](index.html#issuer-key-publication))
2. **Run your verification workflow** for the ticket type: identity proofing for the patient (self access), the patient and the delegate plus delegation authority (delegated access), the linked claim and payer identity (payer claims adjudication), the member attribution and measure (payer quality gap queries). What you must verify per type is in the [Use Case Catalog](use-case-catalog.html).
3. **Mint the ticket** with the required claims (`iss`, `aud`, `exp`, `iat`, `jti`, `ticket_type`, `subject`, `access`), presenter binding where the ticket type requires it (all four current types do), and identity evidence for each person whose verification is the basis of the grant. ([Issuer Requirements](index.html#issuer-requirements))
4. **Host a revocation status list** for any ticket that outlives a session, and give the authorizing person a revocation URL they can reach later without the app. ([Revocation](index.html#revocation))
5. **Keep your records.** The ticket carries facts; you keep the evidence behind them, retrievable by `jti`. ([Issuer vs. Data Holder Responsibility](index.html#issuer-vs-data-holder-responsibility), [Proposal 007](proposal-007-issuer-accountability.html))

One deployable kickoff for delivering tickets to clients — a standard SMART App Launch whose token response carries tickets — is drafted in [Proposal 003](proposal-003-smart-launch-issuance.html).

### If you build an app (Client)

1. **Get a ticket** from an issuer (out of band, or via [Proposal 003](proposal-003-smart-launch-issuance.html)).
2. **Check support** in each Data Holder's `.well-known/smart-configuration` (`grant_types_supported`, `smart_permission_ticket_types_supported`).
3. **Present the ticket** at the token endpoint: one POST with your client assertion and the ticket as `subject_token`, requesting SMART v2 scopes within what the ticket allows. ([Request](index.html#transport-token-exchange-rfc-8693))
4. **Use the access token** for FHIR reads as usual. Re-present the ticket when the token expires; get a fresh ticket from the issuer when the ticket expires.
5. **Handle `interaction_required`** if you can: it means the Data Holder could not match the patient and wants one interactive disambiguation. Background clients can treat it as an error and move on. ([Proposal 001](proposal-001-authz-code-fallback.html))

The signing and verification code in the [source bundle](downloads.html) generates all the worked examples and is a working reference for each role.
