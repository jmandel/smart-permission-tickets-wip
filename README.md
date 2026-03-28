# SMART Permission Tickets

Portable, issuer-signed authorization grants for FHIR data access — presented via [OAuth 2.0 Token Exchange (RFC 8693)](https://www.rfc-editor.org/rfc/rfc8693).

## What is a Permission Ticket?

A Permission Ticket is a JWT that carries a self-contained authorization grant: **who** can access **whose** data, **what** data, and under **what constraints**. A trusted issuer signs the ticket; a client presents it to any Data Holder in the ticket's audience to obtain a scoped access token — no user login required.

```
Trusted Issuer ──mints ticket──▶ Client App ──token exchange──▶ Data Holder (FHIR)
                                                                    │
                                                              access token
                                                                    │
                                                              FHIR Resources
```

## Key Design Points

- **RFC 8693 Token Exchange** — the ticket is a `subject_token`, cleanly separated from client authentication
- **FHIR-native** — subjects, requesters, and business context use FHIR resource structures
- **Sender-constrained** — optional `cnf.jkt` binding ensures only the intended client can redeem the ticket
- **Discoverable** — Data Holders advertise supported ticket types via `.well-known/smart-configuration`
- **Seven use-case ticket types** — patient access, authorized representative, public health, social care, payer claims, research, provider consult

## Repository Structure

```
input/
  pagecontent/index.md    # Full technical specification
  fsh/                    # FHIR Shorthand (logical model)
  examples/signed-tickets # Generated signed JWT examples
  includes/generated/     # Generated HTML/markdown snippets
scripts/
  types.ts                # TypeScript interfaces
  use_case_catalog.ts     # Use case registry (7 ticket types)
  generate_examples.ts    # Signs example JWTs for each use case
  sync_spec_snippets.ts   # Generates spec include files
  generate_keys.ts        # Dev key generation
start.md                  # Executive summary and problem statement
sushi-config.yaml         # FHIR IG Publisher configuration
```

## Building

This is a FHIR Implementation Guide. Prerequisites: Node.js, Java (for the IG Publisher).

```sh
# Install dependencies
npm install

# Generate examples and spec snippets
npx ts-node scripts/generate_examples.ts
npx ts-node scripts/sync_spec_snippets.ts

# Build the IG (requires FHIR IG Publisher)
./_genonce.sh
```

## Specification

The full specification is in [`input/pagecontent/index.md`](input/pagecontent/index.md). The executive summary is in [`start.md`](start.md).

## Status

Draft — this specification is under active development.
