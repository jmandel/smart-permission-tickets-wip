{% include callouts.html %}

This page tells you what to build for one role. It is non-normative; the [specification](index.html) governs. Read it to scope the work, then implement against the normative sections it links to.

You are adding one grant type to your existing SMART-on-FHIR token endpoint. No new endpoints, no user-facing screens.

1. **Accept token exchange.** Handle `grant_type=urn:ietf:params:oauth:grant-type:token-exchange` with a `subject_token_type` of `https://smarthealthit.org/token-type/permission-ticket`. Advertise both in `.well-known/smart-configuration`, along with the `ticket_type` URIs you accept. ([Transport](index.html#transport-token-exchange-rfc-8693))
2. **Authenticate the client** exactly as you already do for SMART Backend Services or UDAP. The ticket never replaces client authentication. ([Trust and Client Registration](index.html#trust-and-client-registration))
3. **Validate the ticket** through the pipeline: signature against the issuer's published JWKS, issuer trust for this ticket type, `exp`/`aud`, revocation check, presenter binding, identity evidence, access constraints (reject any you cannot enforce), subject resolution. Implement it as written — the step order matters for correct error responses. ([Server-Side Validation](index.html#server-side-validation))
4. **Resolve the subject** to one local patient record from `subject.patient` demographics, corroborated by identity evidence when present. Zero or multiple matches → reject with `invalid_grant`. ([Subject Resolution](index.html#subject-resolution))
5. **Issue a scoped access token**: the intersection of requested scopes, the ticket's `access`, client eligibility, ticket-type rules, and your own policy. Enforce `data_period` by applying each resource type's designated date search parameter as an implicit filter — searches your server already supports. ([Access Calculation](index.html#access-calculation), [Data Period Enforcement](data-period.html#data-period-enforcement))
6. **Configure trusted issuers** per ticket type. Trusting an issuer for patient self-access does not trust it for delegated access.

Start with patient self access: it has no requester, no profile claims, and a single policy question — can you match the patient. The [conformance section](index.html#data-holder-requirements) is your checklist, [Access Constraints](access-constraints.html) defines what you enforce, and the [signed examples](use-case-catalog.html) are your test vectors.
