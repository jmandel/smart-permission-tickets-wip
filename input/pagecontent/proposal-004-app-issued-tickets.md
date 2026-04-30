{% include callouts.html %}

**Status:** Draft for discussion | **Author:** Josh Mandel | **Date:** April 30, 2026

### Summary

This proposal defines an app-issued ticket profile for patient self-access. It allows a trusted app to sign its own Permission Ticket after an IAL2 identity proofing event, while still supporting the pattern where a third-party identity/permission service signs the ticket and binds it to the app.

A Permission Ticket continues to carry a FHIR-normalized `subject.patient` for matching and audit, and adds `subject_identity_evidence` as the high-assurance evidence backing that subject claim.

The first supported evidence form is an embedded OIDC ID token:

```json
{
  "source": "embedded",
  "token_type": "id_token",
  "jwt": "eyJhbGciOi..."
}
```

The embedded ID token is verified independently by the Data Holder. It is not trusted merely because the Permission Ticket contains it.

### Problem

Patient self-access needs two things at once:

1. A FHIR-shaped patient representation that Data Holders can match against local records.
2. Evidence that the ticket issuer actually identity-proofed the person represented by that FHIR `Patient`.

The base `subject.patient` claim solves the first problem. It gives the Data Holder an interoperable FHIR object with names, identifiers, birth date, and other matchable facts. But `subject.patient` by itself is an issuer assertion. For IAL2-style use cases, the Data Holder also needs to know what identity proofing event backs that assertion.

This proposal supplies that evidence without replacing `subject.patient` and without requiring an additional token-exchange parameter. It also defines how presenter binding works when the app itself is the Permission Ticket issuer.

### Proposal

For the UC1 patient self-access profile:

* `subject.patient` remains required.
* `requester` remains absent. The ticket type means the requester is the subject.
* `subject_identity_evidence` is required.
* `subject_identity_evidence.source` is `embedded`.
* `subject_identity_evidence.token_type` is `id_token`.
* `subject_identity_evidence.jwt` contains the compact serialized ID token.

The ticket issuer is responsible for constructing the FHIR-normalized `subject.patient` from the identity event, issuer-side records, user-provided consent context, or other verified sources allowed by the profile. The Data Holder uses `subject.patient` as the primary matching input and uses the embedded ID token as evidence backing the subject claim.

When the app is the ticket issuer, `presenter_binding` is omitted and the authenticated presenter must be the same entity as the Permission Ticket issuer. When a third-party service is the ticket issuer, the ticket uses `presenter_binding` to constrain redemption to the app.

### Walkthrough

Dorothy uses a consumer app to gather her records across a network.

1. Dorothy completes an IAL2 identity proofing flow with an identity provider.
2. The identity provider returns an ID token whose `aud` identifies the Permission Ticket issuer as the relying party.
3. The ticket issuer builds a FHIR `Patient` representation for Dorothy.
4. The ticket issuer embeds the ID token in `subject_identity_evidence`.
5. The ticket issuer signs a Permission Ticket whose `aud` targets the Data Holder or network.
6. The app presents the Permission Ticket to a Data Holder token endpoint using the existing Permission Ticket token-exchange flow.

The ID token audience and the Permission Ticket audience intentionally differ:

```text
embedded_id_token.aud = Permission Ticket issuer
permission_ticket.aud = Data Holder or network
```

The Data Holder is not accepting the ID token as an access token for itself. It is using the ID token as evidence that the trusted ticket issuer was the relying party for Dorothy's identity proofing event.

### Ticket Shape

The following decoded payload shows the app-issued pattern. The app is both the Permission Ticket issuer and the presenting client, so `presenter_binding` is omitted under this UC1 profile.

```json
{
  "iss": "https://app.example.org",
  "aud": "https://network.example.org",
  "aud_type": "trust_framework",
  "exp": 1777584000,
  "jti": "dorothy-self-access-001",
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
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
    "jwt": "eyJhbGciOi...ID_TOKEN_FOR_APP..."
  },
  "access": {
    "permissions": [
      {
        "kind": "data",
        "resource_type": "Observation",
        "interactions": ["read", "search"]
      },
      {
        "kind": "data",
        "resource_type": "MedicationRequest",
        "interactions": ["read", "search"]
      }
    ],
    "data_period": {
      "start": "2021-01-01",
      "end": "2026-01-01"
    }
  }
}
```

### Issuer Patterns

#### App-Issued Ticket

In this pattern, the app is trusted as a Permission Ticket issuer and signs its own tickets.

```text
embedded_id_token.aud = https://app.example.org
permission_ticket.iss = https://app.example.org
permission_ticket.aud = https://network.example.org
permission_ticket.presenter_binding = absent
authenticated presenter = https://app.example.org
```

For this UC1 profile, absent `presenter_binding` does not mean any authenticated client may redeem the ticket. It means the authenticated presenter must be the Permission Ticket issuer.

#### Third-Party Ticket Issuer

In this pattern, a trusted identity/permission service handles the identity proofing ceremony and signs the Permission Ticket for an app.

```text
embedded_id_token.aud = https://issuer.example.org
permission_ticket.iss = https://issuer.example.org
permission_ticket.aud = https://network.example.org
permission_ticket.presenter_binding = app client key or app entity
authenticated presenter = app
```

The third-party issuer is the relying party for the ID token. The app is only the presenter, so the ticket uses `presenter_binding` to constrain redemption to that app.

The decoded ticket differs only in the issuer and binding claims:

```json
{
  "iss": "https://issuer.example.org",
  "aud": "https://network.example.org",
  "aud_type": "trust_framework",
  "exp": 1777584000,
  "jti": "dorothy-third-party-001",
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
  "presenter_binding": {
    "method": "jkt",
    "jkt": "base64url-jwk-thumbprint-of-app-key"
  },
  "subject": {
    "patient": {
      "resourceType": "Patient",
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
    "jwt": "eyJhbGciOi...ID_TOKEN_FOR_ISSUER..."
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

### Audience Rule

The embedded ID token's `aud` value MUST identify the Permission Ticket issuer as the relying party.

The most interoperable form is exact equality:

```text
embedded_id_token.aud = permission_ticket.iss
```

The profile can allow a non-identical value only when the Data Holder can verify that the value maps to the same entity as `permission_ticket.iss` through public trust-framework metadata or local configuration.

An opaque identity-provider-local client ID is not sufficient for portable verification. For example, if `embedded_id_token.aud = "abc123"`, an outside Data Holder usually has no reliable way to know that `abc123` is the same entity as `permission_ticket.iss`.

### Verification

For UC1 embedded identity evidence, the Data Holder verifies:

1. The Permission Ticket `aud` covers this Data Holder directly or through a trust framework.
2. The Permission Ticket `iss` is a trusted Permission Ticket issuer.
3. The Permission Ticket signature, `exp`, `jti`, `ticket_type`, and access constraints are valid.
4. The presenting client authenticates normally.
5. If `presenter_binding` is present, the presenting client matches it.
6. If `presenter_binding` is absent, the presenting client is the Permission Ticket issuer.
7. `subject_identity_evidence.source` is `embedded` and `token_type` is `id_token`.
8. The embedded ID token signature is valid under a trusted identity issuer.
9. The embedded ID token satisfies profile requirements such as IAL2 `acr`, acceptable `auth_time`, and required identity claims.
10. The embedded ID token audience identifies the Permission Ticket issuer as the relying party.
11. The Data Holder resolves the patient using `subject.patient`, optionally supplemented by embedded ID token claims.
12. If overlapping facts from `subject.patient` and the embedded ID token materially conflict, the Data Holder rejects the exchange unless a narrower profile defines a reconciliation rule.

### Why Embed First

Embedding keeps the token exchange simple: the Permission Ticket remains the sole `subject_token`, and the Data Holder receives one signed authorization artifact containing both the FHIR-normalized subject and the identity evidence.

The tradeoff is that tickets now carry identity PII and a nested JWT. Implementations need care around logging, storage, retention, and token lifetimes. Future profiles may define detached evidence if those tradeoffs become unacceptable, but this proposal starts with one shape to avoid mode explosion.
