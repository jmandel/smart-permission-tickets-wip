{% include callouts.html %}

**Status:** Non-normative considerations for discussion \| **Author:** Josh Mandel \| **Date:** June 9, 2026

### Summary

Cryptography proves a ticket came from an issuer. It does not prove the issuer did its job, will still exist next year, or can answer for a grant when someone disputes it. Those are the questions a Data Holder's lawyers ask before any signature gets checked. This page collects the non-cryptographic expectations a trust framework or certification program should impose on Permission Ticket issuers. Nothing here is base conformance; it is the checklist that makes "we trust this issuer" a defensible sentence.

### Verification Discipline

The base specification says the issuer verifies real-world facts before minting. A framework admitting issuers should pin down, per ticket type:

- Which identity verification standard applies (for example, IAL2 for UC1/UC2) and which providers are acceptable.
- What the delegation-verification workflow must include for each UC2 authority code (the [per-code obligations](use-case-catalog.html#issuer-verification-obligations) are the starting point).
- What triggering-event evidence backs B2B tickets (the case report behind a UC3 ticket).

### Record Retention and Audit

Every ticket carries a `jti`. The issuer is the party that can answer "why did this grant exist?"

- Retain the verification evidence behind each ticket — identity proofing events, delegation records, examined instruments, triggering events — keyed by `jti`, for a framework-defined retention period.
- Answer audit requests from framework participants within a framework-defined time.
- Log issuance, revocation, and status-list changes in tamper-evident form.

### Continuity

An issuer that disappears strands every outstanding ticket and breaks revocation checking (which fails closed: an unreachable status list means rejected tickets — safe, but disruptive).

- State publicly what happens to outstanding tickets, status lists, and retained records if the issuer winds down, and fund status-list hosting through the longest outstanding ticket lifetime.
- Treat acquisition or change of control as a framework-notifiable event; retained verification records and signing keys should not silently change hands.
- Frameworks may require escrow of status lists and audit records with a continuity agent.

### Key Management

- Protect ticket-signing keys at a bar comparable to a certificate authority's: hardware-backed storage, rotation via `kid`, published compromise procedures.
- On compromise, revoke affected status lists, notify the framework, and re-key. Data Holders cache JWKS, so document expected propagation time.

### Transparency

Public, append-only issuance logs — in the spirit of Certificate Transparency — would let third parties detect anomalous issuance (tickets minted for a subject who never interacted with the issuer) rather than relying on each Data Holder to notice. This is the most speculative item here and would need its own design work: what gets logged (likely `jti`, `ticket_type`, issuance time — not subject data), who runs logs, and who watches them.

### Certification Hooks

Programs that already certify identity providers and consumer apps (for example, app-library admission in the CMS health tech ecosystem) can extend to ticket issuers. A practical certification would attest to the sections above: verification discipline, retention, continuity, and key management. Frameworks then point to the certification instead of each Data Holder evaluating each issuer alone.
