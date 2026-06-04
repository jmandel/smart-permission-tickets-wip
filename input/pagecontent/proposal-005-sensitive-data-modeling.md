{% include callouts.html %}

**Status:** Experimental profile draft for discussion | **Author:** Josh Mandel | **Date:** May 27, 2026

### Summary

This proposal defines an experimental Permission Ticket profile for communicating sensitivity-category handling in a ticket. The profile introduces a top-level `sensitivity_policy` claim that lets an issuer express category-specific exclusion rules and category-specific authorization signals using FHIR-compatible codings.

This profile is intentionally separate from the base `access` object. It is useful only when a ticket type, trust framework, and responding Data Holder have enough shared vocabulary and enforcement capability to honor sensitivity-category rules. When the claim is present, it is must-understand because ignoring it could cause over-disclosure.

### Motivation

Permission Tickets are intended to supply policy-selection inputs to Data Holders, not to create new release policies. Sensitive-data handling is legally variable and implementation-specific. Data Holders differ in how they classify records, whether those classifications are available at API response time, how patient choices are captured, and how those choices map to portal, API, ROI, and internal access-control policies.

This profile is guided by the following design principles:

- **Use categories, not a boolean.** Sensitivity handling should be expressed with coded categories rather than a single include/exclude switch.
- **Separate withholding from authorization.** A rule that says "do not send this category" is operationally different from a signal that says "this category is within the authorization scope."
- **Preserve Data Holder authority.** A ticket can narrow release, but it cannot require a Data Holder to release data prohibited by law, local policy, or technical limitations.
- **Support data minimization.** Clients and issuers should be able to ask responders to withhold categories the recipient is not prepared or authorized to handle.
- **Avoid disclosure leakage.** Responders may need to withhold data without revealing whether such data exists.
- **Fail closed when enforcement is required.** If a must-understand sensitivity rule cannot be enforced, the Data Holder should reject rather than silently ignore it.

### Profile Identifier

| Item | Value |
|------|-------|
| Profile URI | `https://smarthealthit.org/permission-ticket-profile/sensitivity-policy-v1` |
| Claim name | `sensitivity_policy` |
| Claim location | Top-level Permission Ticket payload claim |
| `must_understand` | REQUIRED whenever `sensitivity_policy` is present |
| Applies to | Ticket types or trust-framework profiles that explicitly incorporate this profile |

This profile does not define a new `ticket_type`. Instead, it is a composable profile that a ticket-type profile may incorporate. For example, a patient-access profile or research-access profile could say that it supports `https://smarthealthit.org/permission-ticket-profile/sensitivity-policy-v1` and then define which code systems and local mappings are acceptable for that use case.

### Claim Shape

The `sensitivity_policy` claim is an object with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `withhold` | Coding[] | Sensitivity categories that SHALL be withheld if matched. |
| `release_authorized` | Coding[] | Sensitivity categories that the issuer attests are within the authorization scope, subject to Data Holder policy and law. |
| `unlisted_sensitive_data` | `"local_policy"` \| `"withhold"` \| `"release_authorized"` | How to treat locally classified sensitive data that does not match a `release_authorized` or `withhold` entry. Defaults to `"local_policy"` if absent. |

At least one of `withhold`, `release_authorized`, or `unlisted_sensitive_data` SHALL be present. If `unlisted_sensitive_data` is `"withhold"`, the ticket requires withholding all locally classified sensitive data except categories explicitly listed in `release_authorized`. If `unlisted_sensitive_data` is `"release_authorized"`, the issuer is attesting that all locally classified sensitive data is within the authorization scope except categories explicitly listed in `withhold`.

`unlisted_sensitive_data: "release_authorized"` is the broadest and highest-risk mode. It SHOULD only be used when the selected ticket-type profile or trust framework permits it and the issuer's authorization ceremony covers all locally classified sensitive data not otherwise withheld.

`withhold` serves two directions of intent: the patient's or issuer's exclusion choices, and the recipient's own data minimization. A client that does not want sensitive categories — for example, to insulate itself from special handling obligations — can request tickets that withhold them, and a Data Holder can honor that exclusion confidently because it only ever narrows release.

Each entry in `withhold` or `release_authorized` is a FHIR `Coding`:

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

### Example: Authorize One Category, Withhold Other Local Sensitive Data

This ticket says HIV/AIDS-sensitive information is within the authorization scope, but other locally classified sensitive data should be withheld unless separately authorized:

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

The `release_authorized` entry does not force disclosure. It means the issuer has attested that this sensitivity category is not outside the ticket's authorization scope. The Data Holder still applies local law, local policy, patient matching, resource-level authorization, and technical enforceability checks.

### Vocabulary Starting Points

This profile uses FHIR `Coding` values and expects ticket-type profiles to constrain the supported vocabularies. Starting points include:

- [FHIR Security Labels](https://build.fhir.org/security-labels.html)
- [v3 Confidentiality](https://terminology.hl7.org/en/ValueSet-v3-Confidentiality.html)
- [v3 Information Sensitivity Policy](https://terminology.hl7.org/en/ValueSet-v3-InformationSensitivityPolicy.html)

The v3 Information Sensitivity Policy value set includes sensitivity categories such as `ETH` for substance-abuse information sensitivity and `HIV` for HIV/AIDS information sensitivity. These codes identify categories. They do not by themselves define when a Data Holder must release or withhold data; that interpretation remains profile-specific, trust-framework-specific, and local-policy-specific.

### Processing Semantics

`sensitivity_policy` is an additional access constraint. It narrows the data that may be returned; it never broadens `access.permissions`, `data_period`, `data_holder_filter`, client registration, or local policy.

Data Holders implementing this profile SHALL apply the following rules:

1. If `sensitivity_policy` is present, verify that `must_understand` includes `sensitivity_policy`.
2. Evaluate `withhold` before `release_authorized`. If data matches both, `withhold` wins.
3. If data matches a `withhold` category, withhold it.
4. If data matches an `release_authorized` category, treat that category as within the ticket's authorization scope, but release only if all other Data Holder policy, law, patient matching, and technical constraints permit release.
5. If `unlisted_sensitive_data` is `"withhold"`, withhold locally classified sensitive data that does not match an `release_authorized` entry.
6. If `unlisted_sensitive_data` is `"release_authorized"`, treat locally classified sensitive data that does not match a `withhold` entry as within the ticket's authorization scope, but release only if all other Data Holder policy, law, patient matching, and technical constraints permit release.
7. If `unlisted_sensitive_data` is absent or `"local_policy"`, apply local policy for locally classified sensitive data that is not otherwise matched by `withhold` or `release_authorized`.
8. If the Data Holder cannot enforce a presented must-understand sensitivity rule, reject with `invalid_grant` and an appropriate `error_description`.

This profile does not require Data Holders to reveal whether withheld sensitive data exists. Error descriptions and audit entries should be designed so they do not create impermissible disclosure leakage.

### Matching Categories

Data Holders MAY match sensitivity categories through:

- FHIR security labels present on returned resources.
- Local classifications mapped to the profile-supported coding system.
- Encounter, department, service-line, order, diagnosis, note-type, or patient-level classifications when local policy treats those classifications as equivalent to the listed sensitivity category.

Ticket-type profiles that incorporate this profile SHOULD define which code systems and local mappings are in scope. A Data Holder that cannot determine whether responsive data falls into a required withholding category SHALL either withhold conservatively or reject the request if it cannot enforce the policy.

### Issuer Requirements

Issuers using this profile SHALL:

- Include `sensitivity_policy` as a top-level claim.
- Include `sensitivity_policy` in `must_understand`.
- Use code systems permitted by the incorporating ticket-type profile or trust framework.
- Distinguish withholding rules from affirmative authorization signals.
- Avoid placing supporting sensitive documents directly in the ticket unless the incorporating profile explicitly requires that evidence.
- Retain any authorization evidence required by the trust framework or ticket-type profile.

### Data Holder Requirements

Data Holders supporting this profile SHALL:

- Recognize `sensitivity_policy` as a must-understand top-level claim.
- Enforce `withhold` and `unlisted_sensitive_data: "withhold"` when they are present.
- Treat `release_authorized` and `unlisted_sensitive_data: "release_authorized"` as permission to include a category, not as a mandate to release it.
- Reject when they cannot enforce a must-understand sensitivity rule.
- Apply local law and local policy even when a category is authorized by the ticket.
- Avoid responses that reveal the existence of withheld sensitive data when non-disclosure is required.

### Relationship to Trust Frameworks

Trust frameworks or ticket-type profiles incorporating this profile should define:

- Which issuers may use `sensitivity_policy`.
- Which ticket types may carry it.
- Which code systems and codes are accepted.
- What patient or requester authorization ceremony is required before an issuer may populate `release_authorized` or `unlisted_sensitive_data: "release_authorized"`.
- Whether `withhold` rules may be client-requested, patient-requested, issuer-imposed, or trust-framework-imposed.
- What evidence the issuer must retain.
- How responders may audit issuer compliance.
- How local mappings from EHR classifications to profile codes are validated or documented.

### Full Example Fragment

The following fragment shows the claim in context. It is not a complete ticket:

```json
{
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
  "must_understand": ["sensitivity_policy"],
  "sensitivity_policy": {
    "withhold": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "ETH",
        "display": "substance abuse information sensitivity"
      }
    ],
    "release_authorized": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "HIV",
        "display": "HIV/AIDS information sensitivity"
      }
    ],
    "unlisted_sensitive_data": "local_policy"
  }
}
```

### Open Questions

> **Open Question (OQ-5A): Disclosure Leakage.** How should a Data Holder respond when a client requests a sensitivity category but local policy, law, or patient preference prevents release and the Data Holder should not reveal whether such data exists?
{: .callout .callout-open-question #oq-5a}

> **Open Question (OQ-5B): Vocabulary Scope.** Should early implementations constrain this profile to v3 Information Sensitivity Policy codes, or should they also support confidentiality levels, privacy-law codes, or locally profiled value sets?
{: .callout .callout-open-question #oq-5b}

> **Open Question (OQ-5C): Unknown Classification.** Should the profile define an explicit behavior for resources whose sensitivity classification is unknown, or is `unlisted_sensitive_data` sufficient?
{: .callout .callout-open-question #oq-5c}
