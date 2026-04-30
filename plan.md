# Permission Ticket Identity Evidence Plan

## Goal

Model individual access tickets where the Permission Ticket carries both a core FHIR-shaped `subject.patient` representation and high-assurance identity evidence, without putting non-FHIR fields inside FHIR-shaped resources.

The starting point is embedded identity evidence. Detached hash-plus-parameter modes are intentionally out of scope for this first pass.

## Roles

- `subject`: the patient whose records are being accessed.
- `requester`: the real-world party requesting access. In individual self-access, the requester is the subject and does not need a separate ticket field.
- `presenter`: the software client redeeming the ticket.
- `ticket issuer`: the party that signs the Permission Ticket and is the intended audience of the embedded ID token.
- `identity issuer`: the IAL2 identity provider that signs the ID token.
- `Data Holder`: the server evaluating the ticket and issuing a down-scoped access token.

These roles must stay separate even when two of them are the same entity in a deployment.

## Core Shape

The core `subject.patient` representation remains part of the Permission Ticket. It gives Data Holders a FHIR-shaped, interoperable patient description for matching and audit, and it may be more complete or more operationally useful than the raw identity-token claims.

Identity evidence is modeled as a top-level Permission Ticket claim, not as a property inside a FHIR `Patient`, `RelatedPerson`, `Practitioner`, `PractitionerRole`, or `Organization` fragment. The evidence supports the subject/requester claims; it does not replace them.

For individual self-access:

```json
{
  "iss": "https://ticket-issuer.example.org",
  "aud": "https://network.example.org",
  "aud_type": "trust_framework",
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
  "presenter_binding": {
    "method": "jkt",
    "jkt": "base64url-jwk-thumbprint-of-presenting-client-key"
  },
  "subject": {
    "patient": {
      "resourceType": "Patient",
      "identifier": [
        {
          "system": "urn:oid:2.16.840.1.113883.4.1",
          "value": "999-99-9999"
        }
      ],
      "name": [
        {
          "family": "Reyes",
          "given": ["Dorothy"]
        }
      ],
      "birthDate": "1952-04-12"
    }
  },
  "subject_identity_evidence": {
    "source": "embedded",
    "token_type": "id_token",
    "jwt": "eyJhbGciOi..."
  },
  "access": {
    "permissions": [
      {
        "kind": "data",
        "resource_type": "Observation",
        "interactions": ["read", "search"]
      }
    ]
  }
}
```

For individual self-access, `requester` and `requester_identity_evidence` are omitted. The ticket type supplies the semantics that the requester is the subject.

The Data Holder SHOULD use `subject.patient` as the primary matching input. The embedded ID token provides high-assurance backing evidence and may provide additional claims that help matching. Where the same fact appears in both places, the values are expected to be consistent under the ticket issuer's validation policy.

## Subject, Requester, And Evidence

The core model has two optional evidence slots:

- `subject_identity_evidence`: evidence for the patient / data subject.
- `requester_identity_evidence`: evidence for the requesting actor when the requester is different from the subject.

For UC1 individual self-access, `subject.patient` and `subject_identity_evidence` are populated. `requester` remains omitted.

For UC2 delegated access, the likely shape is:

```json
{
  "subject": {
    "patient": {
      "resourceType": "Patient",
      "identifier": [],
      "name": [],
      "birthDate": "1952-04-12"
    }
  },
  "subject_identity_evidence": {
    "source": "embedded",
    "token_type": "id_token",
    "jwt": "eyJhbGciOi...PATIENT..."
  },
  "requester": {
    "resourceType": "RelatedPerson",
    "relationship": []
  },
  "requester_identity_evidence": {
    "source": "embedded",
    "token_type": "id_token",
    "jwt": "eyJhbGciOi...REQUESTER..."
  }
}
```

This preserves FHIR semantics: FHIR fragments stay FHIR-shaped, and JWT/OIDC evidence stays in explicit top-level ticket claims.

`subject.patient` is not just a lossy copy of the ID token. It is the ticket issuer's FHIR-normalized subject representation. The issuer may derive it from the ID token, enrich it from consent or issuer-side records, or normalize identity-wallet claims into FHIR structures that Data Holders can process consistently.

## Embedded Evidence Shape

Start with exactly one explicit evidence source:

```json
{
  "source": "embedded",
  "token_type": "id_token",
  "jwt": "eyJhbGciOi..."
}
```

The embedded JWT is not trusted because it appears inside the Permission Ticket. The Data Holder verifies it independently using the identity issuer's keys and applicable trust policy.

## Core Spec Changes

The core specification should define the identity evidence slots without making all use-case-specific verification rules global.

Core changes:

- Add `subject_identity_evidence` and `requester_identity_evidence` as optional top-level Permission Ticket claims.
- Add these claims to the base/kernel claim list so they are core semantics, not `must_understand` extensions.
- Define the initial evidence object shape:

  ```json
  {
    "source": "embedded",
    "token_type": "id_token",
    "jwt": "eyJhbGciOi..."
  }
  ```

- Preserve `subject.patient` as the FHIR subject representation. Identity evidence supports the subject; it does not replace the FHIR subject.
- State that ticket-type profiles define when evidence is required and what verification semantics apply.

The core specification should not make `id_token.aud == permission_ticket.iss` a universal rule. That rule belongs in the individual-access profile/proposal because it is specific to embedded OIDC ID token evidence used for self-access.

## Proposal Page

Create a concrete proposal page, likely:

```text
input/pagecontent/proposal-004-embedded-identity-evidence.md
```

The page should show how embedded identity evidence works end to end for real individual self-access. It should be narrative and example-driven rather than just field definitions.

Suggested structure:

1. Problem: Data Holders need to know how the FHIR `subject.patient` in a self-access ticket is backed by IAL2 identity proofing.
2. Proposal: UC1 self-access tickets include `subject.patient` and `subject_identity_evidence`.
3. Walkthrough: Dorothy uses a consumer app, completes IAL2 identity proofing, the ticket issuer builds a FHIR-normalized `subject.patient`, embeds the ID token, signs the ticket, and either self-issues as the presenting app or binds the ticket to the app.
4. Ticket examples: decoded Permission Tickets for both app self-issued and third-party-issued patterns, showing `subject.patient`, `subject_identity_evidence`, network/Data Holder `aud`, and ticket issuer `iss`.
5. Verification: the Data Holder validates the ticket, applies either presenter binding or the self-issued presenter rule, validates the embedded ID token, applies the UC1-specific audience rule, and resolves the patient primarily from `subject.patient`.
6. Issuer patterns: app-issued ticket and third-party-issued ticket.
7. Tradeoffs: embedded evidence keeps redemption simple and self-contained, while accepting that tickets carry identity PII and need profile rules for ID token freshness/lifetime.

## UC1 Audience Binding

For the UC1 embedded-ID-token proposal, the ID token audience and Permission Ticket audience intentionally differ.

When the app signs its own ticket:

```text
id_token.aud = app / ticket issuer
permission_ticket.iss = app / ticket issuer
permission_ticket.aud = network or Data Holder
permission_ticket.presenter_binding = absent
authenticated presenter = app / ticket issuer
```

When a third-party service handles IAL2 and ticket issuance:

```text
id_token.aud = third-party ticket issuer
permission_ticket.iss = third-party ticket issuer
permission_ticket.aud = network or Data Holder
permission_ticket.presenter_binding = app client key
```

The UC1 proposal should require a portable relying-party audience identifier in the embedded ID token:

```text
embedded_id_token.aud identifies the Permission Ticket issuer as the relying party
```

In practice, the simplest interoperable rule is:

```text
embedded_id_token.aud = permission_ticket.iss
```

The profile should strongly prefer that exact form. More generally, `embedded_id_token.aud` needs to be a widely recognized entity identifier, not an opaque identity-provider-local client ID. If the ID token audience is a local client ID such as `abc123`, an outside Data Holder usually has no reliable way to know that `abc123` represents the same entity as `permission_ticket.iss`.

The profile can allow a non-identical audience only when the Data Holder can verify the mapping through public trust-framework metadata or local configuration. A mapping asserted only by the Permission Ticket issuer is not enough, because it does not independently prove that the embedded ID token was issued to that issuer as the relying party.

The Data Holder is not accepting the ID token as an access token for itself. It is accepting the ID token as evidence that the trusted ticket issuer was the proper relying party for the identity event.

## UC1 Presenter Binding

For the UC1 embedded-ID-token proposal, `presenter_binding` has profile-specific semantics:

- If `presenter_binding` is present, the Data Holder verifies it normally. This is the expected shape when a third-party ticket issuer mints a ticket for an app.
- If `presenter_binding` is absent, the presenting client MUST be the Permission Ticket issuer. This supports app self-issued tickets without repeating an explicit binding to the same app.

In the absent-binding case, the Data Holder verifies that the authenticated presenting client identity corresponds to `permission_ticket.iss` under the applicable client identity scheme. For key-based client authentication, this may mean that the client authentication key is also authorized for the ticket issuer identity, or that the Data Holder's trust framework maps both to the same entity.

This absent-binding interpretation is UC1-specific profile behavior. It should not silently change the base specification's general treatment of absent `presenter_binding` for other ticket types.

Practical issuer patterns:

```text
App self-issued UC1 ticket:
  id_token.aud = app / ticket issuer
  permission_ticket.iss = app / ticket issuer
  permission_ticket.presenter_binding = absent
  authenticated presenter = app / ticket issuer

Third-party-issued UC1 ticket:
  id_token.aud = third-party ticket issuer
  permission_ticket.iss = third-party ticket issuer
  permission_ticket.presenter_binding = app client key or app entity
  authenticated presenter = app
```

## UC1 Data Holder Verification

For an individual self-access ticket with embedded subject identity evidence, the Data Holder verifies:

1. The Permission Ticket `aud` covers this Data Holder, either directly or through a trust framework the Data Holder belongs to.
2. The Permission Ticket `iss` is a trusted Permission Ticket issuer.
3. The Permission Ticket signature, `exp`, `jti`, `ticket_type`, and access constraints are valid.
4. The presenting client authenticates normally.
5. If `presenter_binding` is present, the presenting client matches it.
6. If `presenter_binding` is absent, the presenting client is the Permission Ticket issuer.
7. `subject_identity_evidence.source` is `embedded` and `token_type` is `id_token`.
8. The embedded ID token signature is valid under a trusted identity issuer.
9. The embedded ID token satisfies profile requirements such as IAL2 `acr`, freshness via `auth_time`, and any required identity claims.
10. The embedded ID token `aud` identifies the Permission Ticket issuer as the relying party, preferably by exact equality with `permission_ticket.iss`; any non-identical mapping must be independently verifiable by the Data Holder.
11. The Data Holder resolves the patient using `subject.patient`, optionally supplemented by embedded ID token claims. If resolution fails or is ambiguous, it rejects the exchange or follows an explicitly supported interaction-required path.
12. If the Data Holder compares overlapping facts from `subject.patient` and the embedded ID token and finds a material inconsistency, it rejects the exchange unless a narrower profile defines a reconciliation rule.

## Core Semantics And Must-Understand

Because `subject_identity_evidence` and `requester_identity_evidence` are core semantics, they are not listed in `must_understand`. A Data Holder that supports Permission Tickets must understand these claims when present.

For now, keep `source: "embedded"` as the only defined source to avoid mode explosion. Future profiles can add detached evidence if the embedded-token tradeoffs become unacceptable.
