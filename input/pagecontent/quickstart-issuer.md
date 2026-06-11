{% include callouts.html %}

This page tells you what to build for one role. It is non-normative; the [specification](index.html) governs. Read it to scope the work, then implement against the normative sections it links to.

You verify real-world facts and sign a JWT. The Data Holder relies on your verification, so most requirements are about what you do before signing.

1. **Publish keys** at `{iss}/.well-known/jwks.json`. ([Issuer Key Publication](index.html#issuer-key-publication))
2. **Run your verification workflow** for the ticket type: identity proofing for the patient (self access), the patient and the delegate plus delegation authority (delegated access), the linked claim and payer identity (payer claims adjudication), the member attribution and measure (payer quality gap queries). What you must verify per type is in the [Use Case Catalog](use-case-catalog.html).
3. **Mint the ticket** with the required claims (`iss`, `aud`, `exp`, `iat`, `jti`, `ticket_type`, `subject`, `access`), presenter binding where the ticket type requires it (all four current types do), and identity evidence for each person whose verification is the basis of the grant. ([Issuer Requirements](index.html#issuer-requirements))
4. **Host a revocation status list** for any ticket that outlives a session, and give the authorizing person a revocation URL they can reach later without the app. ([Revocation](index.html#revocation))
5. **Keep your records.** The ticket carries facts; you keep the evidence behind them, retrievable by `jti`. ([Issuer vs. Data Holder Responsibility](index.html#issuer-vs-data-holder-responsibility), [Proposal 007](proposal-007-issuer-accountability.html))

One deployable kickoff for delivering tickets to clients — a standard SMART App Launch whose token response carries tickets — is drafted in [Proposal 003](proposal-003-smart-launch-issuance.html).
