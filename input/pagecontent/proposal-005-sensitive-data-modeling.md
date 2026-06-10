{% include callouts.html %}

**Status:** Experimental profile draft for discussion | **Author:** Josh Mandel | **Date:** May 27, 2026 (rev. June 9, 2026: narrowed to withholding only)

### Summary

This proposal defines an experimental Permission Ticket profile for **withholding** sensitivity categories. The profile introduces a top-level `sensitivity_policy` claim that lets an issuer say: do not send data in these categories. It uses FHIR-compatible sensitivity codings.

A withholding rule only ever narrows release. That gives it two properties no affirmative rule has: a Data Holder can honor it from any issuer without trusting that issuer (a request to send less cannot cause harm), and it can be enforced conservatively (when classification is uncertain, withhold more). It binds to labeling infrastructure that exists today — for example, CMS Blue Button tags 42 CFR Part 2-sensitive claims and filters them in B2B APIs.

The claim is must-understand whenever present, because ignoring it could cause over-disclosure.

**What this profile does not do.** It does not let a ticket authorize release of sensitive categories that local policy would otherwise hold back. That affirmative direction is the eventual payoff — a way for a patient to say "yes, include my behavioral health data" and have a restricted category flow — but it depends on standardized authorization workflows for sensitive categories, precise (not conservative) classification, and legal comfort with relying on an issuer-attested ceremony. None of those exists yet. When they do, an affirmative companion profile can be added without changing this one.

### Motivation

Two parties want withholding:

* **The patient or issuer**, excluding categories from a grant ("share my record, but not my substance-use history").
* **The recipient itself**, as data minimization. A client that is not prepared or authorized to handle a category — and wants to insulate itself from the special handling obligations that come with it — can ask that the category never be sent. A Data Holder can honor that confidently because it only narrows release.

Data Holders differ in how they classify restricted or legally protected data and whether classifications are available at API response time. This profile does not require any particular classification scheme; it requires that a Data Holder either enforce the withholding rule against its own classifications or reject the ticket.

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
| `unlisted_sensitive_data` | `"local_policy"` \| `"withhold"` | How to treat locally classified sensitive data that does not match a `withhold` entry. `"local_policy"` (the default if absent) leaves it to the Data Holder's normal rules; `"withhold"` requires withholding all locally classified sensitive data. |

At least one of `withhold` or `unlisted_sensitive_data` SHALL be present.

Each entry in `withhold` is a FHIR `Coding`:

```json
{
  "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
  "code": "ETH",
  "display": "substance abuse information sensitivity"
}
```

### Example: Withhold a Category

This ticket says the Data Holder must withhold data it classifies as substance-abuse-sensitive, while applying local policy to other sensitivity categories:

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

### Example: Withhold All Locally Classified Sensitive Data

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

`sensitivity_policy` is an additional access constraint. It narrows the data that may be returned; it never broadens `access`, client registration, or local policy.

Data Holders implementing this profile SHALL:

1. If `sensitivity_policy` is present, verify that `must_understand` includes `sensitivity_policy`.
2. Withhold data matching a `withhold` category.
3. If `unlisted_sensitive_data` is `"withhold"`, withhold all locally classified sensitive data.
4. If `unlisted_sensitive_data` is absent or `"local_policy"`, apply local policy to locally classified sensitive data not matched by `withhold`.
5. When classification is uncertain, withhold conservatively, or reject the request if the policy cannot be enforced at all.
6. If the rule cannot be enforced, reject with `invalid_grant` and an appropriate `error_description`.

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
- Record whether each `withhold` rule was patient-requested, client-requested, issuer-imposed, or framework-imposed, for audit.

### Relationship to Trust Frameworks

Trust frameworks or ticket-type profiles incorporating this profile should define:

- Which issuers and ticket types may carry `sensitivity_policy`.
- Which code systems and codes are accepted.
- Whether `withhold` rules may be client-requested, patient-requested, issuer-imposed, or trust-framework-imposed.
- How local mappings from EHR classifications to profile codes are validated or documented.

### Open Questions

> **Open Question (OQ-5A): Disclosure Leakage.** How should a Data Holder respond when withholding applies and the Data Holder should not reveal whether such data exists?
{: .callout .callout-open-question #oq-5a}

> **Open Question (OQ-5B): Vocabulary Scope.** Should early implementations constrain this profile to v3 Information Sensitivity Policy codes, or also support confidentiality levels, privacy-law codes, or locally profiled value sets?
{: .callout .callout-open-question #oq-5b}

> **Open Question (OQ-5C): Unknown Classification.** Should the profile define an explicit behavior for resources whose sensitivity classification is unknown, or is conservative withholding under rule 5 sufficient?
{: .callout .callout-open-question #oq-5c}
