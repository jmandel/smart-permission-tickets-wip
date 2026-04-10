# SMART Permission Tickets

A FHIR Implementation Guide for portable, issuer-signed authorization grants that a client presents at any eligible Data Holder to obtain a scoped FHIR access token, with no user login at the Data Holder.

## What is a Permission Ticket

A Permission Ticket is an issuer-signed JWT presented to a Data Holder's token endpoint via [OAuth 2.0 Token Exchange (RFC 8693)](https://www.rfc-editor.org/rfc/rfc8693). It carries a **subject** (whose data), an optional **requester** (on whose behalf), an **access** grant (what resources, which interactions, and optional narrowing filters), and an optional **context** object whose schema is selected by `ticket_type`. The Data Holder authenticates the presenting client with standard SMART Backend Services, verifies the ticket signature against the issuer's published JWKS, enforces presenter binding when present, resolves the subject to a local patient record, and issues an access token scoped to the intersection of requested and ticket-authorized access.

```text
        Trigger event
              |
              v
   +----------------------+    mints ticket     +-------------+
   |   Trusted Issuer     | ------------------> |  Client App |
   |  (verifies context)  |   (signed JWT)      +------+------+
   +----------------------+                            |
                                                       | POST /token
                                                       |  grant_type = token-exchange
                                                       |  subject_token = <ticket>
                                                       |  client_assertion = <smart bbs>
                                                       v
                                                +-----------------+
                                                |   Data Holder   |
                                                |  (FHIR + auth)  |
                                                |  - verify client|
                                                |  - verify ticket|
                                                |  - intersect    |
                                                +--------+--------+
                                                         | scoped access token
                                                         v
                                                     FHIR reads
```

The signed payload has a small, fixed shape:

```text
+---------------------------------------------------------------+
| JWT envelope:  iss  aud  exp  jti  iat  ticket_type           |  signed by issuer
+---------------------------------------------------------------+
| subject:       patient (FHIR Patient, may be thin)            |  whose data
|                recipient_record?   (resolution hint)          |
+---------------------------------------------------------------+
| requester?     RelatedPerson | Practitioner |                 |  on whose behalf
|                PractitionerRole | Organization                |  (issuer-attested)
+---------------------------------------------------------------+
| access:        permissions[] (DataPermission | Operation)     |  what and how much
|                data_period?                                   |
|                data_holder_filter?                            |
|                sensitive_data?                                |
+---------------------------------------------------------------+
| context?       ticket-type-specific workflow facts            |  why
+---------------------------------------------------------------+
| presenter_binding?   jkt | framework_client                   |  who may redeem
| revocation?          { url, index }                           |  status pointer
| must_understand?     [ extension claim names ]                |  fail-closed gate
+---------------------------------------------------------------+
```

## Mental model

A Permission Ticket is a **portable, issuer-signed authorization grant** — a capability the issuer hands a client, redeemable at any Data Holder inside the ticket's audience. Compared to a vanilla SMART-on-FHIR access token, it sits one step earlier in the flow: it is the artifact a client presents to *get* an access token, not the token itself. Compared to a UMA permission ticket, it is signed and self-contained — the Data Holder validates it offline against the issuer's published keys, with no callback to the issuer at redemption time. Compared to an opaque bearer assertion, it is structured and discriminated by `ticket_type`, so the Data Holder knows exactly which schema and processing rules to apply.

The payload separates concerns deliberately. A small **portable kernel** carries only the fields a recipient needs to say yes or no: subject, access, presenter binding, revocation, and the JWT envelope. Per-`ticket_type` **context** carries the workflow facts that matter for one use case but not others — a public-health investigation's reportable condition, a payer's claim, a research study, a consult request. The seam between kernel and context is load-bearing for interop: any Data Holder can validate any ticket's kernel even if it has never heard of that `ticket_type`, and a Data Holder that *has* heard of a `ticket_type` knows exactly which extra fields it must understand.

## Key design points

- **Token exchange transport ([RFC 8693](https://www.rfc-editor.org/rfc/rfc8693)), not a custom redemption endpoint.** The ticket rides as a `subject_token` under `grant_type=urn:ietf:params:oauth:grant-type:token-exchange` with `subject_token_type=https://smarthealthit.org/token-type/permission-ticket`. Client authentication is a separate `client_assertion` (standard SMART Backend Services, [RFC 7523](https://www.rfc-editor.org/rfc/rfc7523)), so authorization (the ticket) and authentication (the assertion) stay cleanly separated. A Data Holder that does not implement the spec rejects with `unsupported_grant_type` rather than silently ignoring the ticket.
- **Portable kernel, not per-holder vocabularies.** Every ticket is built from the same fixed kernel; only the optional `context` varies by `ticket_type`. Issuers do not learn each Data Holder's local schema, and Data Holders do not learn each issuer's bespoke ticket shape. Profile extensions live as new top-level claims, never as mutations of kernel structures.
- **Discovery via SMART configuration.** Data Holders advertise support by including the token-exchange grant in `grant_types_supported` and listing accepted ticket-type URIs in `smart_permission_ticket_types_supported` in `.well-known/smart-configuration`. Clients consult this list before presenting a ticket; unknown `ticket_type` values are rejected with `invalid_grant`.
- **Optional, layered presenter binding.** A `presenter_binding` claim binds redemption to a specific client either by `method = "jkt"` (JWK Thumbprint, [RFC 7638](https://www.rfc-editor.org/rfc/rfc7638)) or by `method = "framework_client"` (a UDAP or well-known framework entity). When `presenter_binding` is absent, `aud` plus standard client authentication is the trust boundary. Binding is a constraint **on top of** client authentication, never a substitute.
- **Issuer attests, recipient enforces.** `requester`, `context`, and the legal basis for access are issuer attestations: the Data Holder consumes them for local policy and audit but does not re-verify the requester's identity, delegation relationship, consent, or contract. The recipient's job is resolving the subject, validating the cryptographic envelope, intersecting access, and enforcing the constraints it was given.
- **Must-understand extensibility, fail-closed.** Every kernel field present in a ticket is must-understand: a recipient that cannot enforce one rejects with `invalid_grant`. Profile extensions are new top-level claims; an issuer that requires recognition lists the claim name in `must_understand`, and unaware recipients reject rather than silently ignore. Inspired by JWS `crit` ([RFC 7515 §4.1.11](https://www.rfc-editor.org/rfc/rfc7515)), applied to payload claims.
- **Seven use-case ticket types, not a universal schema.** Patient Self Access, Patient-Delegated Access, Public Health Investigation, Social Care (CBO) Referral, Payer Claims Adjudication, Research Study, and Provider-to-Provider Consult, registered in [scripts/use_case_catalog.ts](scripts/use_case_catalog.ts). Each use case maps to exactly one `ticket_type` URI that selects its context schema and processing rules.

## Repository structure

```text
input/
  pagecontent/index.md          Normative specification prose (the spec)
  pagecontent/downloads.md      Downloads page surfaced in the IG
  examples/                     Signed example tickets surfaced in the IG
  includes/generated/           Snippets and signed JWT artifacts the prose embeds
scripts/
  use_case_catalog.ts           Canonical list of use-case ticket types
  sync_spec_snippets.ts         Regenerates in-prose JSON snippets and schemas
  generate_examples.ts          Signs example tickets for each use case
  generate_keys.ts              Dev key generation for example signing
  bundle-context.ts             Bundles the spec + reference impl into one XML context
reference-implementation/       Working FHIR server, viewer UI, and synthetic data pipeline
sushi-config.yaml               IG configuration (id, canonical, status, version, FHIR version)
ig.ini                          IG Publisher entry point
_genonce.sh                     One-shot SUSHI + IG Publisher build script
_updatePublisher.sh             Downloads the IG Publisher jar on demand
```

The canonical Zod schema for the specification lives in [scripts/permission-ticket-schema.ts](scripts/permission-ticket-schema.ts). The spec's generated JSON Schemas, TypeScript type output, snippet includes, and signed example tickets are all derived from that local file so the published artifacts are reproducible from one source of truth inside the spec repo.

## Building the IG

Prerequisites: Node.js, Java 17 (for the IG Publisher), [SUSHI](https://fshschool.org/docs/sushi/) (`fsh-sushi`, installed by `npm install` at the root), and Ruby 3.3 with `jekyll` (for the IG template). The build script downloads the IG Publisher jar on first run.

```bash
# Install spec dependencies (fsh-sushi, zod)
npm install

# Install the helpers under scripts/ (snippet sync, example signing)
npm --prefix scripts install

# Regenerate snippets, run SUSHI, and run the IG Publisher in one shot
./_genonce.sh
```

`./_genonce.sh` runs `npm --prefix scripts run sync-spec-snippets` to regenerate the prose snippets, JSON Schemas, and generated TypeScript type file from the local Zod schema, then `npm --prefix scripts run generate` to re-sign the example tickets, then `sushi .`, then `./_updatePublisher.sh` (which fetches `input-cache/publisher.jar` if missing), and finally `java -jar input-cache/publisher.jar -ig .`. The rendered IG is written to `output/`.

Continuous build preview: **<https://build.fhir.org/ig/jmandel/smart-permission-tickets-wip/>**.

CI mirrors this pipeline: [`.github/workflows/build-and-deploy.yml`](.github/workflows/build-and-deploy.yml) builds the IG on every push to `main` and publishes it to GitHub Pages. The workflow provisions Java 17, Node 20, Ruby 3.3 with `jekyll`, `fsh-sushi`, and the FHIR IG Publisher jar.

## Where the spec lives

- Normative prose: [input/pagecontent/index.md](input/pagecontent/index.md).
- Canonical Zod schema: [scripts/permission-ticket-schema.ts](scripts/permission-ticket-schema.ts).
- Generated TypeScript type output: [input/includes/generated/typescript/permission-ticket-types.ts](input/includes/generated/typescript/permission-ticket-types.ts).
- Use-case catalog: [scripts/use_case_catalog.ts](scripts/use_case_catalog.ts).
- IG configuration (id, canonical URL, version, FHIR version, status): [sushi-config.yaml](sushi-config.yaml).

The canonical URL of the IG is `http://smarthealthit.org/ig/permission-tickets` (from [sushi-config.yaml](sushi-config.yaml)).

## Status

Draft (pre-ballot), under active development. The authoritative `status` and `version` are tracked in [sushi-config.yaml](sushi-config.yaml) (currently `status: draft`, `version: 0.1.0`, `fhirVersion: 4.0.1`).

## Related

- [reference-implementation/](reference-implementation/) — a runnable Bun + SQLite FHIR server, browser-based viewer, and live protocol trace that exercise this spec end to end. Start with [Architecture at a glance](reference-implementation/README.md#architecture-at-a-glance), then [Shared-nothing per-site architecture](reference-implementation/README.md#shared-nothing-per-site-architecture) for the most important architectural idea, and [Quick start (demo mode)](reference-implementation/README.md#quick-start-demo-mode) to see a ticket minted, exchanged, and redeemed in a browser.
