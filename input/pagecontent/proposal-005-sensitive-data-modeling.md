{% include callouts.html %}

**Status:** Experimental profile draft for discussion | **Author:** Josh Mandel | **Date:** May 27, 2026 (rev. June 2026)

### Summary

This proposal defines an experimental Permission Ticket profile for communicating sensitivity-category handling, in two pieces that live on opposite sides of the [access constraint border](access-constraints.html):

* **`sensitivity_withhold`** — an access constraint: do not send data in these categories. A limit, so it fails closed: a Data Holder that cannot enforce it rejects the ticket rather than silently letting the authorizing person's expectations fail.
* **`sensitivity_release_authorized`** — a top-level profile claim: the issuer attests that these categories are within the authorization scope, subject to Data Holder policy and law. A fact, so it degrades gracefully: a Data Holder that does not recognize it falls back to its own sensitivity gates and releases less.

This profile lives outside the base specification deliberately: its job is to lay out the *shape* of sensitive-data handling ahead of what base APIs can do today. The base kernel only carries what every conforming Data Holder can enforce now; this profile models where sensitive-data management needs to go, so that issuers, EHRs, and trust frameworks can build toward one shape instead of inventing several.

### Motivation

Three parties need these rules:

* **The patient, through the issuer, restricting clients.** "Share my record with this app, but not my substance-use history." The patient's withholding choice is captured once, at the issuer, and travels in the ticket to every Data Holder — that is the core permission-ticket pattern applied to the data patients care most about.
* **The recipient, minimizing its own intake.** A client not prepared to handle a category — and wanting to insulate itself from the special obligations that come with it — can ask that the category never be sent.
* **The patient, unlocking access.** Today, when API policies filter restricted categories, there is often no field a patient can check to let their own data flow. A release authorization is the signal that could change that: the issuer attests the patient's authorization covers the category, and the Data Holder decides under its own policy and law.

### Two Directions, Different Properties

The two pieces carry different trust and enforcement properties, and the split encodes them structurally:

* **Withholding** can be honored without trusting the issuer (a request to send less cannot expand access) and tolerates conservative enforcement — when classification is uncertain, withhold more. But a withholding rule the Data Holder cannot evaluate at all is a broken promise to the patient, which is why it is an access constraint: unrecognized or unenforceable means the ticket is rejected.
* **Release authorization** rests on the issuer's authorization ceremony and requires the Data Holder to trust that ceremony for sensitive categories specifically. It cannot be enforced conservatively in either direction: under-release defeats the patient's intent, over-release is a breach. Trust frameworks adopting this profile SHOULD define which issuers may assert release authorization, for which categories, and what ceremony and evidence stand behind it. A Data Holder that does not implement it ignores it — the patient gets the conservative default instead of no data at all. Issuers SHOULD say so when capturing the authorization: the unlock may not be honored everywhere.

Wherever both match the same data, withholding wins. That is not a special rule of this profile: a constraint always bounds what a fact can unlock, by the base [constraint algebra](access-constraints.html#constraint-algebra).

### Profile Identifier

| Item | Value |
|------|-------|
| Profile URI | `https://smarthealthit.org/permission-ticket-profile/sensitivity-policy-v1` |
| Constraint | `sensitivity_withhold`, a member of `access` |
| Profile claim | `sensitivity_release_authorized`, a top-level claim |
| Applies to | Ticket types or trust-framework profiles that explicitly incorporate this profile |

This profile does not define a new `ticket_type`. It is a composable profile that a ticket-type profile may incorporate, defining which code systems and local mappings are acceptable for that use case. A ticket carrying `sensitivity_withhold` beyond its type's required constraint set is rejected by servers that do not enforce it — the standard consequence, and the desired one.

### Shapes

Both pieces share one shape:

| Field | Type | Description |
|-------|------|-------------|
| `codes` | Coding[] | Sensitivity categories, as FHIR codings. |
| `unlisted` | boolean | When `true`, the rule also covers locally classified sensitive data named in neither piece. Defaults to `false`: unlisted sensitive data follows local policy. |

At least one of a non-empty `codes` or `unlisted: true` SHALL be present in each piece used. Setting `unlisted: true` on `sensitivity_release_authorized` is the broadest mode; it SHOULD only be used when the incorporating ticket-type profile or trust framework permits it and the issuer's ceremony covers all locally classified sensitive data not otherwise withheld.

Each coding is a FHIR `Coding`:

```json
{
  "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
  "code": "ETH",
  "display": "substance abuse information sensitivity"
}
```

### Example: Withhold a Category

The patient told the issuer not to share substance-use data with this app. Other sensitivity categories follow local policy:

```json
"access": {
  "fhir_resources": [ { "type": "Observation", "interactions": ["read", "search"] } ],
  "sensitivity_withhold": {
    "codes": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "ETH",
        "display": "substance abuse information sensitivity"
      }
    ]
  }
}
```

### Example: Authorize One Category, Withhold Other Sensitive Data

The patient authorized sharing HIV-related information; other locally classified sensitive data stays back:

```json
{
  "sensitivity_release_authorized": {
    "codes": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "HIV",
        "display": "HIV/AIDS information sensitivity"
      }
    ]
  },
  "access": {
    "fhir_resources": [ { "type": "Observation", "interactions": ["read", "search"] } ],
    "sensitivity_withhold": { "unlisted": true }
  }
}
```

Release authorization does not force disclosure. It means the issuer attests this category is not outside the ticket's authorization scope. The Data Holder still applies local law, local policy, patient matching, and technical enforceability checks.

### Example: Recipient Data Minimization

A client doing routine medication reconciliation asks never to receive anything the Data Holder classifies as sensitive:

```json
"access": {
  "fhir_resources": [ { "type": "MedicationRequest", "interactions": ["read", "search"] } ],
  "sensitivity_withhold": { "unlisted": true }
}
```

### Vocabulary Starting Points

This profile uses FHIR `Coding` values and expects ticket-type profiles to constrain the supported vocabularies. Starting points include:

- [FHIR Security Labels](https://build.fhir.org/security-labels.html)
- [v3 Confidentiality](https://terminology.hl7.org/en/ValueSet-v3-Confidentiality.html)
- [v3 Information Sensitivity Policy](https://terminology.hl7.org/en/ValueSet-v3-InformationSensitivityPolicy.html)

These codes identify categories. They do not by themselves define what data falls into a category at a given Data Holder; that mapping is profile-specific, trust-framework-specific, and local.

### Processing Semantics

Neither piece broadens any access constraint, client registration, or what law permits. `sensitivity_release_authorized` operates on the Data Holder's own sensitivity gates — it can satisfy a local rule that conditions release on patient authorization, but it cannot override a rule that does not accept ticket-borne authorization.

Data Holders implementing this profile SHALL:

1. Withhold data matching a `sensitivity_withhold` coding unconditionally. When `sensitivity_withhold` sets `unlisted: true`, also withhold all locally classified sensitive data, except data covered by `sensitivity_release_authorized` and permitted under rule 2.
2. Treat data covered by `sensitivity_release_authorized` as within the ticket's authorization scope, releasing only if Data Holder policy, law, patient matching, and technical constraints permit.
3. When classification is uncertain, enforce withholding conservatively (withhold more); never resolve uncertainty in favor of release under rule 2.
4. If a withholding rule cannot be enforced at all, reject with `invalid_grant` — this is the base rule for access constraints, restated.

A Data Holder that does not implement this profile rejects tickets carrying `sensitivity_withhold` (an unrecognized access member) and ignores `sensitivity_release_authorized` (an unrecognized top-level claim). Both defaults protect the patient's conservative expectations.

This profile does not require Data Holders to reveal whether withheld sensitive data exists. Error descriptions and audit entries should not create that disclosure.

### Matching Categories

Data Holders MAY match sensitivity categories through:

- FHIR security labels present on returned resources.
- Local classifications mapped to the profile-supported coding system.
- Encounter, department, service-line, order, diagnosis, note-type, or patient-level classifications when local policy treats those as equivalent to the listed category.

Ticket-type profiles that incorporate this profile SHOULD define which code systems and local mappings are in scope.

### Issuer Requirements

Issuers using this profile SHALL:

- Use code systems permitted by the incorporating ticket-type profile or trust framework.
- Distinguish withholding rules from release authorization in their records: note whether each withholding was patient-requested, client-requested, issuer-imposed, or framework-imposed, and retain the authorization ceremony evidence behind each release authorization.
- Apply the withholding decision to everything that could reveal what was withheld — including issuance-time artifacts such as endpoint hints (see [Proposal 003](proposal-003-smart-launch-issuance.html)).
- Avoid placing supporting sensitive documents directly in the ticket unless the incorporating profile explicitly requires that evidence.

### Relationship to Trust Frameworks

Trust frameworks or ticket-type profiles incorporating this profile should define:

- Which issuers and ticket types may carry these rules, and separately, which may assert release authorization (the higher-trust direction).
- Which code systems and codes are accepted.
- What patient or requester authorization ceremony is required before an issuer may populate `sensitivity_release_authorized`.
- Whether withholding rules may be client-requested, patient-requested, issuer-imposed, or trust-framework-imposed.
- What evidence the issuer must retain, and how responders may audit issuer compliance.
- How local mappings from EHR classifications to profile codes are validated or documented.

### Open Questions

> **Open Question (OQ-5A): Disclosure Leakage.** How should a Data Holder respond when a category is requested but local policy, law, or patient preference prevents release and the Data Holder should not reveal whether such data exists?
{: .callout .callout-open-question #oq-5a}

> **Open Question (OQ-5B): Vocabulary Scope.** Should early implementations constrain this profile to v3 Information Sensitivity Policy codes, or also support confidentiality levels, privacy-law codes, or locally profiled value sets?
{: .callout .callout-open-question #oq-5b}

> **Open Question (OQ-5C): Unknown Classification.** Should the profile define an explicit behavior for resources whose sensitivity classification is unknown, or is `unlisted` plus conservative withholding sufficient?
{: .callout .callout-open-question #oq-5c}

> **Open Question (OQ-5D): Release Authorization Prerequisites.** What authorization UX, classification precision, and trust-framework rules does a Data Holder need before honoring `sensitivity_release_authorized` for a category like 42 CFR Part 2 data, and who certifies that an issuer's ceremony meets the bar?
{: .callout .callout-open-question #oq-5d}
