{% include callouts.html %}

**Status:** Experimental profile draft for discussion | **Author:** Josh Mandel | **Date:** May 27, 2026 (rev. June 10, 2026)

### Summary

This proposal defines an experimental Permission Ticket profile for communicating sensitivity-category handling. The profile introduces a top-level `sensitivity_policy` claim with two kinds of rule, using FHIR-compatible codings:

* **Withholding** — do not send data in these categories.
* **Release authorization** — the issuer attests that these categories are within the authorization scope, subject to Data Holder policy and law.

This profile lives outside the base specification deliberately, and not because it is timid: its job is to lay out the *shape* of sensitive-data handling ahead of what base APIs can do today. The base kernel only carries what every conforming Data Holder can enforce now; this profile models where sensitive-data management needs to go, so that issuers, EHRs, and trust frameworks can build toward one shape instead of inventing several. The claim is must-understand whenever present: a Data Holder that cannot honor the stated rules rejects the ticket rather than silently letting the authorizing person's expectations fail.

### Motivation

Three parties need these rules:

* **The patient, through the issuer, restricting clients.** "Share my record with this app, but not my substance-use history." The patient's withholding choice is captured once, at the issuer, and travels in the ticket to every Data Holder — that is the core permission-ticket pattern applied to the data patients care most about.
* **The recipient, minimizing its own intake.** A client not prepared to handle a category — and wanting to insulate itself from the special obligations that come with it — can ask that the category never be sent.
* **The patient, unlocking access.** Today, when API policies filter restricted categories, there is often no field a patient can check to let their own data flow. A `release_authorized` entry is the signal that could change that: the issuer attests the patient's authorization covers the category, and the Data Holder decides under its own policy and law.

### Two Directions, Different Properties

The two rule kinds carry different trust and enforcement properties. The profile states them plainly so trust frameworks can gate accordingly:

* **Withholding** can be honored without trusting the issuer (a request to send less cannot expand access) and tolerates conservative enforcement — when classification is uncertain, withhold more. But conservative enforcement is not a free pass: a withholding rule the Data Holder cannot evaluate at all is a broken promise to the patient, which is why the claim is must-understand and fail-closed rather than best-effort.
* **Release authorization** rests on the issuer's authorization ceremony and requires the Data Holder to trust that ceremony for sensitive categories specifically. It cannot be enforced conservatively in either direction: under-release defeats the patient's intent, over-release is a breach. Trust frameworks adopting this profile SHOULD define which issuers may assert `release_authorized`, for which categories, and what ceremony and evidence stand behind it.

### Profile Identifier

| Item | Value |
|------|-------|
| Profile URI | `https://smarthealthit.org/permission-ticket-profile/sensitivity-policy-v1` |
| Claim name | `sensitivity_policy` |
| Claim location | Top-level Permission Ticket payload claim |
| `must_understand` | REQUIRED whenever `sensitivity_policy` is present |
| Applies to | Ticket types or trust-framework profiles that explicitly incorporate this profile |

This profile does not define a new `ticket_type`. It is a composable profile that a ticket-type profile may incorporate, defining which code systems and local mappings are acceptable for that use case.

### Claim Shape

| Field | Type | Description |
|-------|------|-------------|
| `withhold` | Coding[] | Sensitivity categories that SHALL be withheld if matched. |
| `release_authorized` | Coding[] | Sensitivity categories the issuer attests are within the authorization scope, subject to Data Holder policy and law. |
| `unlisted_sensitive_data` | `"local_policy"` \| `"withhold"` \| `"release_authorized"` | How to treat locally classified sensitive data that matches neither list. Defaults to `"local_policy"` if absent. |

At least one of `withhold`, `release_authorized`, or `unlisted_sensitive_data` SHALL be present. If `unlisted_sensitive_data` is `"withhold"`, the ticket requires withholding all locally classified sensitive data except categories explicitly listed in `release_authorized`. If it is `"release_authorized"`, the issuer attests that all locally classified sensitive data is within the authorization scope except categories explicitly listed in `withhold`.

`unlisted_sensitive_data: "release_authorized"` is the broadest mode. It SHOULD only be used when the selected ticket-type profile or trust framework permits it and the issuer's authorization ceremony covers all locally classified sensitive data not otherwise withheld.

Each entry in `withhold` or `release_authorized` is a FHIR `Coding`:

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
{
  "must_understand": ["sensitivity_policy"],
  "sensitivity_policy": {
    "withhold": [
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

The patient authorized sharing HIV-related information; other locally classified sensitive data stays back unless separately authorized:

```json
{
  "must_understand": ["sensitivity_policy"],
  "sensitivity_policy": {
    "release_authorized": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "HIV",
        "display": "HIV/AIDS information sensitivity"
      }
    ],
    "unlisted_sensitive_data": "withhold"
  }
}
```

`release_authorized` does not force disclosure. It means the issuer attests this category is not outside the ticket's authorization scope. The Data Holder still applies local law, local policy, patient matching, and technical enforceability checks.

### Example: Recipient Data Minimization

A client doing routine medication reconciliation asks never to receive anything the Data Holder classifies as sensitive:

```json
{
  "must_understand": ["sensitivity_policy"],
  "sensitivity_policy": {
    "unlisted_sensitive_data": "withhold"
  }
}
```

### Vocabulary Starting Points

This profile uses FHIR `Coding` values and expects ticket-type profiles to constrain the supported vocabularies. Starting points include:

- [FHIR Security Labels](https://build.fhir.org/security-labels.html)
- [v3 Confidentiality](https://terminology.hl7.org/en/ValueSet-v3-Confidentiality.html)
- [v3 Information Sensitivity Policy](https://terminology.hl7.org/en/ValueSet-v3-InformationSensitivityPolicy.html)

These codes identify categories. They do not by themselves define what data falls into a category at a given Data Holder; that mapping is profile-specific, trust-framework-specific, and local.

### Processing Semantics

`sensitivity_policy` is an additional access constraint relative to `access`: it never broadens `access.permissions`, `data_period`, `data_holder_filter`, client registration, or what law permits. `release_authorized` operates on the Data Holder's own sensitivity gates — it can satisfy a local rule that conditions release on patient authorization, but it cannot override a rule that does not accept ticket-borne authorization.

Data Holders implementing this profile SHALL:

1. If `sensitivity_policy` is present, verify that `must_understand` includes `sensitivity_policy`.
2. Evaluate `withhold` before `release_authorized`. If data matches both, `withhold` wins.
3. Withhold data matching a `withhold` category.
4. Treat data matching a `release_authorized` category as within the ticket's authorization scope, releasing only if Data Holder policy, law, patient matching, and technical constraints permit.
5. Apply `unlisted_sensitive_data` to locally classified sensitive data matching neither list: `"withhold"` withholds it, `"release_authorized"` treats it per rule 4, absent or `"local_policy"` applies local policy.
6. When classification is uncertain, enforce `withhold` conservatively (withhold more); never resolve uncertainty in favor of release under rule 4.
7. If a stated rule cannot be enforced at all, reject with `invalid_grant` and an appropriate `error_description` — silent partial enforcement is what breaks the authorizing person's expectations.

This profile does not require Data Holders to reveal whether withheld sensitive data exists. Error descriptions and audit entries should not create that disclosure.

### Matching Categories

Data Holders MAY match sensitivity categories through:

- FHIR security labels present on returned resources.
- Local classifications mapped to the profile-supported coding system.
- Encounter, department, service-line, order, diagnosis, note-type, or patient-level classifications when local policy treats those as equivalent to the listed category.

Ticket-type profiles that incorporate this profile SHOULD define which code systems and local mappings are in scope.

### Issuer Requirements

Issuers using this profile SHALL:

- Include `sensitivity_policy` as a top-level claim and list it in `must_understand`.
- Use code systems permitted by the incorporating ticket-type profile or trust framework.
- Distinguish withholding rules from release authorization in their records: note whether each `withhold` was patient-requested, client-requested, issuer-imposed, or framework-imposed, and retain the authorization ceremony evidence behind each `release_authorized` entry.
- Avoid placing supporting sensitive documents directly in the ticket unless the incorporating profile explicitly requires that evidence.

### Relationship to Trust Frameworks

Trust frameworks or ticket-type profiles incorporating this profile should define:

- Which issuers and ticket types may carry `sensitivity_policy`, and separately, which may assert `release_authorized` (the higher-trust direction).
- Which code systems and codes are accepted.
- What patient or requester authorization ceremony is required before an issuer may populate `release_authorized` or `unlisted_sensitive_data: "release_authorized"`.
- Whether `withhold` rules may be client-requested, patient-requested, issuer-imposed, or trust-framework-imposed.
- What evidence the issuer must retain, and how responders may audit issuer compliance.
- How local mappings from EHR classifications to profile codes are validated or documented.

### Open Questions

> **Open Question (OQ-5A): Disclosure Leakage.** How should a Data Holder respond when a category is requested but local policy, law, or patient preference prevents release and the Data Holder should not reveal whether such data exists?
{: .callout .callout-open-question #oq-5a}

> **Open Question (OQ-5B): Vocabulary Scope.** Should early implementations constrain this profile to v3 Information Sensitivity Policy codes, or also support confidentiality levels, privacy-law codes, or locally profiled value sets?
{: .callout .callout-open-question #oq-5b}

> **Open Question (OQ-5C): Unknown Classification.** Should the profile define an explicit behavior for resources whose sensitivity classification is unknown, or is `unlisted_sensitive_data` plus conservative withholding sufficient?
{: .callout .callout-open-question #oq-5c}

> **Open Question (OQ-5D): Release Authorization Prerequisites.** What authorization UX, classification precision, and trust-framework rules does a Data Holder need before honoring `release_authorized` for a category like 42 CFR Part 2 data, and who certifies that an issuer's ceremony meets the bar?
{: .callout .callout-open-question #oq-5d}
