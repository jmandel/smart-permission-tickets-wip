{% include callouts.html %}

**Status:** Draft for discussion | **Author:** Josh Mandel | **Date:** April 30, 2026

### The Idea

An app should be able to generate a Permission Ticket that a network or Data Holder can trust.

The app does not get this trust just by saying "trust me." It needs three things:

1. The network recognizes the app as an entity that is allowed to issue this kind of ticket.
2. The app can show that the patient completed a high-assurance identity proofing event.
3. The ticket is signed by the app and redeemed by that same app.

This proposal shows how that works for patient self-access. The patient uses an app, completes an IAL2 identity proofing flow, and the app signs a Permission Ticket authorizing itself to request the patient's data across a network.

### What The Ticket Proves

For a Data Holder, the app-issued ticket answers five practical questions:

| Question | Where the answer appears |
|---|---|
| Who signed this authorization? | `iss` and the ticket signature |
| Which Data Holders or network is it for? | `aud` and `aud_type` |
| Which patient is it about? | `subject.patient` |
| What identity proofing backs that patient claim? | `subject_identity_evidence` |
| Which app may redeem it? | the authenticated presenter, and optionally `presenter_binding` |

For app-issued patient self-access, the app is both the ticket issuer and the presenter. That means `presenter_binding` can be omitted: the Data Holder requires the authenticated presenting client to be the same entity as `iss`.

### Cast Of Characters

In the main example:

* **Dorothy** is the patient.
* **Health Wallet App** is the app Dorothy chose.
* **ID Proofing Provider** verifies Dorothy at IAL2 and issues an ID token.
* **Health Wallet App** signs the Permission Ticket.
* **Community Health Network** is the network named in the ticket audience.
* **Hospital A** is a Data Holder in that network.

The app is not asking Hospital A to trust an arbitrary self-declared patient. It is asking Hospital A to trust a signed Permission Ticket from a recognized app issuer, backed by a signed ID token from an identity provider.

### End-To-End Walkthrough

#### 1. Dorothy Chooses The App

Dorothy opens Health Wallet App and asks it to gather her records from the Community Health Network.

The app knows it is allowed to issue patient self-access tickets in that network. It has an entity identifier and signing keys that Data Holders can verify through the network's trust framework or local configuration.

```text
app entity: https://wallet.example.org
ticket signing keys: published for https://wallet.example.org
network audience: https://community-network.example.org
```

#### 2. Dorothy Completes Identity Proofing

The app sends Dorothy through an IAL2 identity proofing flow.

The identity provider returns an ID token to the app. The important point is that the ID token's audience identifies the app as the relying party:

```text
id_token.iss = https://idp.example.org
id_token.aud = https://wallet.example.org
id_token.acr = IAL2-equivalent assurance value
```

The ID token is not meant to be an access token for Hospital A. It is evidence that Dorothy proved her identity to the app.

#### 3. The App Builds A FHIR Patient

The app creates the ticket's `subject.patient` as a FHIR Patient fragment:

```json
{
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
```

This FHIR representation remains important. It is what Data Holders use for patient matching and audit. It may be normalized or enriched by the app from verified identity claims or other trusted sources.

#### 4. The App Embeds The Identity Evidence

The app puts the ID token into `subject_identity_evidence`:

```json
{
  "source": "embedded",
  "token_type": "id_token",
  "jwt": "eyJhbGciOi...ID_TOKEN_FOR_WALLET_APP..."
}
```

The embedded ID token backs the `subject.patient` claim. It does not replace `subject.patient`, and the Data Holder still verifies the ID token independently.

#### 5. The App Signs The Permission Ticket

The app signs a Permission Ticket. A decoded payload looks like this:

```json
{
  "iss": "https://wallet.example.org",
  "aud": "https://community-network.example.org",
  "aud_type": "trust_framework",
  "exp": 1777584000,
  "jti": "dorothy-wallet-001",
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
    "jwt": "eyJhbGciOi...ID_TOKEN_FOR_WALLET_APP..."
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

There is no `requester` because this is self-access. The patient described by `subject.patient` is the person requesting access.

There is no `presenter_binding` because the app is issuing the ticket for its own presentation. In this profile, absence of `presenter_binding` has a strict meaning: the client presenting the ticket must be the same entity as `iss`.

#### 6. The App Presents The Ticket

The app calls Hospital A's token endpoint using the normal Permission Ticket token exchange:

```http
POST /token HTTP/1.1
Host: fhir.hospital-a.example.org
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=eyJhbGciOi...PERMISSION_TICKET...
&subject_token_type=https://smarthealthit.org/token-type/permission-ticket
&scope=patient/Observation.rs patient/MedicationRequest.rs
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
&client_assertion=eyJhbGciOi...CLIENT_ASSERTION_FROM_WALLET_APP...
```

The Permission Ticket is the authorization grant. The `client_assertion` authenticates the app that is presenting it.

### What Hospital A Checks

Hospital A can evaluate the request without sending Dorothy through another login flow.

It checks:

1. The app's `client_assertion` authenticates as `https://wallet.example.org`.
2. The Permission Ticket signature verifies under keys for `https://wallet.example.org`.
3. The ticket `aud` covers Hospital A, either directly or through `https://community-network.example.org`.
4. The ticket has not expired.
5. The ticket type is patient self-access.
6. Because `presenter_binding` is absent, the authenticated presenter must equal the ticket issuer.
7. The embedded ID token signature verifies under the identity provider's keys.
8. The embedded ID token says its relying party audience is `https://wallet.example.org`.
9. The embedded ID token satisfies the profile's assurance and freshness requirements.
10. `subject.patient` resolves to one local patient record.
11. The requested scopes fit inside the ticket's `access` block.

If those checks pass, Hospital A issues a scoped access token to the app.

### Why The ID Token Audience Matters

The embedded ID token must have been issued to the ticket issuer as the relying party:

```text
id_token.aud = permission_ticket.iss
```

That rule is what links the identity proofing event to the entity that signed the ticket.

If the ID token audience were an opaque value such as `abc123`, Hospital A would usually have no way to know whether `abc123` is really the same entity as `https://wallet.example.org`. A profile can allow a different audience identifier only when Hospital A can verify the mapping through public trust-framework metadata or local configuration.

### When A Third Party Issues The Ticket

Some apps will not sign their own tickets. Instead, an identity or permission service may run the identity proofing and sign the ticket for the app.

That is still compatible with this model, but the roles change:

```text
id_token.aud = https://issuer.example.org
permission_ticket.iss = https://issuer.example.org
authenticated presenter = https://wallet.example.org
permission_ticket.presenter_binding = wallet app key or entity
```

Here the third-party service is the ticket issuer and the ID token relying party. The app is only the presenter, so the ticket needs explicit `presenter_binding` to make sure only that app can redeem it.

The key distinction is:

| Pattern | Ticket issuer | ID token audience | Presenter rule |
|---|---|---|---|
| App-issued ticket | App | App | Presenter must equal ticket issuer |
| Third-party-issued ticket | Service | Service | Presenter must match `presenter_binding` |

This proposal is mainly about the first row: making the app-issued pattern concrete enough that networks and Data Holders can evaluate it consistently.

### Notes For Implementers

App-issued tickets make the app a real trust participant. Data Holders need a way to discover or configure the app's issuer identity and ticket-signing keys.

The embedded ID token may contain sensitive identity information. Implementations should treat Permission Tickets containing `subject_identity_evidence` as identity-bearing artifacts for logging, storage, and retention purposes.

The FHIR `subject.patient` and embedded ID token should not materially conflict. If they do, the Data Holder should reject the exchange unless a narrower profile defines a reconciliation rule.
