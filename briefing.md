# SMART Permission Tickets: Hospital Counsel Briefing and Interview Guide

## Purpose of This Briefing

We are seeking input from hospital legal, privacy, compliance, release-of-information, and access-governance counsel on how health systems currently decide whether to release patient data through digital/API channels when a request is supported by an external authorization artifact.

The immediate project is **SMART Permission Tickets**. A Permission Ticket is an issuer-signed JWT that a client presents to a Data Holder's token endpoint using OAuth 2.0 Token Exchange. The ticket is meant to carry the facts a Data Holder needs to evaluate a request without requiring the patient, proxy, or requesting organization to create a local portal account or repeat an authorization ceremony at every hospital.

This briefing is not asking counsel to bless a final policy model. It is meant to help the technical working group understand current hospital practices, policy categories, legal review points, and operational constraints so the specification can expose the right inputs and avoid inventing fields that hospitals cannot responsibly use.

Please do not include privileged legal advice, confidential contract language, or identifiable patient examples unless your organization has authorized that disclosure. We are looking for generalized practices, decision criteria, and examples that can be discussed across organizations.

## Project Context

### Project Goals and Boundaries

The project goals are to:

- Define a compact, issuer-signed authorization artifact that can travel with a client across multiple Data Holders.
- Let Data Holders evaluate requests without requiring a fresh user login or consent ceremony at every endpoint.
- Carry enough structured facts for Data Holders to select and enforce existing local policies.
- Keep client authentication separate from authorization: the client proves who it is, while the ticket carries the grant and context.
- Support individual access, delegated/proxy access, public health, payer, research, social care, and provider-consult use cases with a common core model.
- Identify where the base specification should stop and narrower profiles, trust frameworks, contracts, or hospital policy should take over.

The project is not trying to:

- Define hospital release policy.
- Decide what law permits in any particular state or fact pattern.
- Force a hospital to accept an issuer it does not trust.
- Replace ROI/legal review workflows where those remain necessary.
- Define a universal sensitive-data taxonomy in the base kernel.
- Require every hospital to expose data beyond what its law, policy, contracts, or technical controls permit.

### What a Permission Ticket Does

A Permission Ticket is a portable authorization grant. A trusted issuer signs a ticket that identifies:

- The **subject** whose data is being requested, usually a patient.
- The **requester**, if the request is on behalf of someone other than the subject, such as a proxy, public health agency, payer, research organization, or consulting clinician.
- The **access** being requested, such as FHIR resource types, operations, time windows, or Data Holder filters.
- The **ticket type**, which identifies the use case and the profile-specific processing rules.
- Optional **presenter binding**, which binds ticket redemption to a specific client key or trust-framework-recognized client identity.
- Optional **identity evidence**, such as an embedded IAL2 identity token, when the selected profile uses external identity evidence for patient or requester identity.

The client presents the ticket to the Data Holder. The Data Holder authenticates the client, verifies the ticket signature and issuer trust, checks audience and presenter binding, resolves the patient locally, and then applies local policy before issuing a constrained access token.

### What a Permission Ticket Is Not Intended to Do

The ticket is not intended to rewrite a hospital's release policy or force the hospital to ignore local law, institutional policy, or technical safeguards.

The working model is:

- The **issuer** verifies real-world facts before minting the ticket.
- The **ticket** carries the facts that are useful for hospital policy selection and audit.
- The **Data Holder** decides whether it trusts the issuer and whether the ticket facts map to a local policy that permits release.
- The **Data Holder** enforces the final access constraints, subject matching rules, local sensitivity rules, and applicable law.

In other words, the ticket should help the hospital choose among its existing policy pathways. It should not require hospitals to implement a new release policy merely because a ticket says so.

### The Clean-Separation Design Challenge

One of the main design goals is to avoid moving the same operational burden from one place to another. If every Data Holder must re-check the same identity, authority, consent, and documentation facts for every request, the ticket adds little value. If the issuer makes broad claims that responders cannot safely rely on, the ticket creates unacceptable risk. We are looking for the clean middle ground.

A useful responsibility split might look like this:

| Party | Primary responsibility | Should not be responsible for |
|-------|------------------------|-------------------------------|
| **Ticket Issuer** | Verify real-world facts before minting: patient identity, requester identity, relationship or authority, consent or legal basis, scope, expiration, and revocation path. Retain supporting evidence or audit records. | Making final release decisions for every Data Holder's local law, local policy, patient matching, EHR configuration, or technical enforceability. |
| **Data Holder / Responder** | Decide whether it trusts the issuer for this ticket type, resolve the local patient, map ticket facts to local policy, enforce technical constraints, apply local sensitivity rules, and log the decision. | Repeating every real-world verification step already performed by a trusted issuer, unless local policy or law requires it. |
| **Trust Framework / Agreement** | Define who may issue which ticket types, what verification steps issuers must perform, what evidence they must retain, what responders may rely on, audit rights, liability allocation, revocation, incident handling, and minimum technical conformance. | Encoding every hospital's detailed release policy or every state-specific edge case directly into the ticket format. |
| **Client / Presenter** | Authenticate to the Data Holder, prove possession of any bound key, present the correct ticket, request only needed scopes, and respect downstream obligations. | Being the sole party responsible for proving patient identity, legal authority, or scope unless the trust framework explicitly assigns that role to the client. |

The ticket itself should carry enough structured information for a responder to say: "Given our local policy and our trust agreement with this issuer, we know which pathway applies." It should not carry so much detail that every ticket becomes a portable legal case file.

For example, counsel might consider whether a delegated-access ticket should say only:

```text
requester = RelatedPerson, relationship = daughter
```

or whether it should also include an issuer-attested authorization basis:

```text
authorization_basis = healthcare_power_of_attorney
issuer_retains_evidence = true
expires = 2026-12-31
```

The first shape may be too thin for responders. The second may be enough if the trust agreement says what "healthcare_power_of_attorney" requires the issuer to verify, what evidence must be retained, and what audit rights the responder has. A third option would be to attach evidence directly in or near the ticket, but that may increase privacy risk, operational complexity, and data minimization concerns.

We want counsel to help identify which facts belong in each layer:

- **Ticket field**: must be available at token-processing time for automated policy selection or audit.
- **Issuer-retained evidence**: must exist and be reviewable later, but need not be sent to every Data Holder.
- **Trust agreement requirement**: defines the issuer's duties and the responder's reliance rights.
- **Responder-local decision**: must remain with the Data Holder because it depends on local law, patient matching, local policy, or system capability.

### Failure Modes to Avoid

Please consider designs that avoid these failure modes:

- **Re-verification everywhere**: every hospital still has to repeat all identity, relationship, and legal authority checks.
- **Blind reliance**: responders are expected to accept an issuer's conclusion without knowing the verification standard, retained evidence, or audit remedy.
- **Over-disclosure**: tickets contain sensitive supporting documents or policy facts that do not need to be shown to every responder.
- **False precision**: tickets include fine-grained sensitivity or authority fields that current systems cannot enforce.
- **One-size-fits-all trust**: an issuer trusted for patient self-access is automatically assumed to be trusted for guardianship, public health, research, or payer requests.
- **Burden shifted to clients**: consumer apps or platforms become responsible for legal determinations they are not equipped to make.
- **Responder-only policy opacity**: issuers and clients cannot tell what facts responders need, causing repeated failed requests or manual escalation.

### Why Counsel Input Is Needed

Recent working-group discussions surfaced several questions that are not primarily technical:

- What facts does a hospital need to accept an external attestation that someone may access another person's records?
- Is a family relationship enough, or must the ticket also communicate the legal/authorization basis for access?
- Which decisions are made by legal/policy categories, and which are made by local EHR configuration, patient portal settings, or release-of-information staff?
- How do hospitals handle minors, divorced parents, guardianship, power of attorney, incarceration, proxy bans, and other special statuses?
- What categories of sensitive or legally protected data are treated differently today?
- Are there standardized authorization-flow choices for sensitive categories, or are those still local and evolving?
- When a shared EHR serves multiple legal entities, what does it mean to target a request to a particular hospital, clinic, custodian, or endpoint?
- What would a hospital need from a trust framework or contract before accepting an external ticket issuer's attestation?

The working group needs a realistic view of current hospital practice before deciding what belongs in the base specification versus what should remain in narrower profiles or future proposals.

## Current Use Cases Under Discussion

The specification currently models seven use cases:

1. **Patient self-access**: A patient authorizes an app to retrieve their records from one or more Data Holders.
2. **Patient-delegated access**: A proxy, representative, parent, guardian, or other RelatedPerson accesses a patient's records.
3. **Public health investigation**: A public health authority uses a ticket for follow-up access after a reportable event.
4. **Social care referral**: A community-based organization or social care hub receives access related to a referral.
5. **Payer claims adjudication**: A payer requests clinical records to support a claim or service review.
6. **Research study access**: A research organization accesses records based on patient consent or study authorization.
7. **Provider consult**: A consulting clinician or organization accesses records for a consultation or referral.

The highest-priority legal/policy questions have arisen around patient self-access, delegated/proxy access, sensitive data, requester trust, and shared Data Holder/custodian organization boundaries.

## Key Design Concepts for Counsel Review

### Issuer vs. Data Holder Responsibility

The issuer is expected to perform real-world verification before minting a ticket: identity proofing, requester verification, relationship or authority checks, consent or legal basis validation, and scope selection. The Data Holder is expected to decide whether the issuer is trusted for the relevant use case and then enforce local policy.

Question for counsel: for which decisions can your organization rely on an external issuer's attestation, and for which decisions must your organization independently verify facts or retain supporting documents?

### Requester vs. Presenter

The **requester** is the real-world party for whom the access exists. The **presenter** is the software client that redeems the ticket. They may be the same organization, but not always. For example, a platform may present tickets on behalf of multiple requesters, or a shared client may serve multiple organizations.

Question for counsel: when you evaluate a release, do you care primarily who the real-world requester is, who operates the software, or both?

### Relationship vs. Authorization Basis

For delegated access, a relationship code such as "mother", "daughter", or "spouse" may be insufficient by itself. The legally relevant fact may be that the requester is a guardian, has healthcare power of attorney, has a custody right, has patient delegation, or has some other legally sufficient authority.

The specification can represent some of this today using FHIR `RelatedPerson.relationship` codings, but the working group is considering whether a separate machine-readable authorization-basis signal is needed.

Question for counsel: what would need to be stated, attested, evidenced, or retained for your organization to accept an external delegated-access ticket?

### Sensitive or Legally Protected Data

The working group has decided not to include a simple `sensitive_data: include/exclude` flag in the base kernel. The concern is that a single boolean is not expressive enough and may not map to current hospital authorization systems. Sensitive-data handling is therefore being moved into a separate proposal for future profile-specific work.

Question for counsel: what sensitive or legally protected categories are treated differently today, and are those categories exposed through API authorization decisions in a way an external ticket could meaningfully influence?

### Identity Evidence

The base model includes optional identity-evidence slots. The initial shape is an embedded ID-token-style JWT, suitable for profiles that rely on an IAL2 identity token. Future profiles may define other evidence token types, such as mobile driver's license or verifiable credential formats.

Question for counsel: under what circumstances would your organization accept an externally verified identity token as part of patient matching, proxy verification, or requester verification?

### Data Holder vs. Custodian Organization

A single technical FHIR endpoint may serve multiple facilities, clinics, brands, legal entities, or custodians. Some systems can filter by facility or custodian; others maintain an integrated patient chart that cannot be reliably partitioned by the facility the patient selected.

Question for counsel: when a request names a hospital, clinic, or organization, what entity is legally and operationally authorized to respond, and can the data be limited to that entity's portion of the record?

## Interview Questions

The following questions are intentionally broad. Not every question will apply to every organization. Please answer at the level of policy category or operational practice; examples are useful if they are generalized and non-identifiable.

### 1. Organizational Context

1. What types of entities does your organization operate or support for purposes of data release: hospitals, clinics, physician groups, ACOs, health plans, laboratories, public health interfaces, research operations, or other entities?
2. Do different legal entities share a single EHR instance or patient portal?
3. Do different facilities or legal entities share a single FHIR endpoint or API authorization server?
4. Who owns or approves policy for API-based release decisions: legal, privacy, compliance, HIM/ROI, security, medical records, patient access, IT governance, or another group?
5. Are patient portal access policies and API app access policies governed by the same policy framework or by separate processes?

### 2. Current Policy Categories and Access Classes

1. Does your EHR or portal use a finite set of access profiles, proxy classes, relationship classes, or policy buckets?
2. Which categories are criteria-based, and which can be manually assigned by staff?
3. Are there special access profiles for minors, teen patients, parents, guardians, adult proxies, incarcerated patients, behavioral health restrictions, research participants, abusive users, banned portal users, staff-patients, VIP/confidential patients, or other categories?
4. Which of these categories affect API access, portal access, both, or neither?
5. When a request comes in through an API, what internal policy inputs determine whether data may be released?
6. Are policy decisions made at token issuance, resource access, chart-display time, ROI workflow time, or some combination?
7. Are policy decisions deterministic and computable, or do some require staff review?

### 3. Patient Self-Access

1. When an adult patient requests their own records through a digital/API channel, what does your organization need to verify?
2. Does the patient need an existing portal account, or can a remotely identity-proofed patient request access without one?
3. Would your organization accept a high-assurance external identity proofing result for patient self-access?
4. What assurance level, issuer characteristics, audit trail, or contract terms would be required?
5. Are there circumstances where patient self-access is denied, delayed, narrowed, or routed to manual review?
6. Are there clinical-review, result-hold, clinician-signoff, or delay policies that affect what a patient can receive through APIs?
7. Does your policy distinguish between direct patient access and access by a consumer app chosen by the patient?
8. Does your policy distinguish between HIPAA individual access, patient authorization, portal access, and third-party app access?
9. Would a ticket that is presenter-bound to the patient's chosen app satisfy concerns about app impersonation or unauthorized redemption?

### 4. Delegated and Proxy Access

1. What proxy or delegated-access relationships does your organization support today?
2. How do you distinguish ordinary family relationship from legal authority to access records?
3. For a parent accessing a minor child's records, what facts matter: age, state, custody, marital status of parents, adolescent privacy rules, specific service categories, court orders, or other facts?
4. For divorced or separated parents, what evidence is required before granting or denying access?
5. For guardianship, power of attorney, healthcare power of attorney, conservatorship, or personal representative access, what documentation or attestation is required?
6. Are scanned documents retained, abstracted into structured fields, or both?
7. Who reviews proxy documentation: legal, ROI, HIM, registration, clinic staff, patient portal staff, or another group?
8. Are proxy rights all-or-nothing, or can they be limited by data category, facility, date range, encounter, specialty, or action?
9. How are proxy rights revoked, expired, suspended, or re-reviewed?
10. Can a patient delegate access remotely today? If so, what identity proofing and signature steps are required?
11. Would your organization rely on an external issuer's attestation that proxy authority exists?
12. If yes, what would the issuer need to attest: identity of patient, identity of requester, relationship, legal authority, supporting document type, state/jurisdiction, patient consent, scope, expiration, revocation path, or something else?
13. If no, what facts would your organization still need to verify locally?
14. Would a machine-readable authorization-basis field be useful, separate from relationship code? Examples: `patient_delegation`, `parental_authority`, `guardian`, `healthcare_power_of_attorney`, `court_order`, `state_mandate`.
15. Are there authorization-basis categories that should never be exposed to the requester because doing so may reveal sensitive facts?

### 5. Minor and Adolescent Privacy

1. How does your organization determine when parental/proxy access changes because of patient age?
2. Are age thresholds state-specific, service-specific, or configurable by organization?
3. Which categories of minor/adolescent data may be hidden from parents or proxies?
4. Are these categories computable in the EHR today?
5. Are adolescent privacy rules applied consistently across portal, API, ROI, and internal chart access?
6. Can a minor consent to release some categories of data to a parent or third-party app?
7. Does your policy treat emancipated minors, pregnant minors, minors seeking behavioral health care, or minors seeking reproductive health care differently?
8. Are these statuses structured in the EHR or handled by manual policy review?

### 6. Sensitive, Restricted, or Legally Protected Data

1. What categories of data are treated as sensitive, restricted, specially protected, or legally protected in your organization?
2. Are categories based on FHIR security labels, internal EHR flags, encounter types, departments, diagnoses, orders, note types, service areas, payer rules, state-law classifications, or manual tags?
3. Which categories are reliably computable at API response time?
4. Are categories assigned to individual resources, encounters, episodes, departments, patients, or entire charts?
5. Does your system support patient-facing choices about whether to share specific sensitive categories with apps or proxies?
6. If patient-facing choices exist, are they standardized, local, or configured per organization?
7. Can a client request to exclude sensitive categories it does not want to receive?
8. Can a client request to include sensitive categories, and if so, how is patient authorization captured?
9. Are there categories where the system should withhold data without revealing whether such data exists?
10. Are sensitive-data rules different for patient self-access, parent proxy access, adult proxy access, public health, payer, research, and provider-to-provider exchange?
11. Would FHIR security-label vocabularies such as v3 Confidentiality or Information Sensitivity Policy be useful in future ticket profiles?
12. What would need to change in your authorization workflow before a ticket could reliably carry category-specific sensitivity preferences?

### 7. Public Health, Payer, Research, and Provider-to-Provider Requests

1. For public health follow-up, what facts must be present before your organization releases data without patient interaction?
2. Does the reportable condition itself select a policy or limit the responsive data set?
3. For payer requests, what facts matter: claim identifier, service code, coverage relationship, contract, treatment/payment/operations basis, prior authorization, audit rights, or patient authorization?
4. For research access, what facts matter: study identifier, IRB approval, patient consent, waiver, data use agreement, investigator identity, institution, study status, or scope?
5. For provider consults/referrals, what facts matter: ordering provider, referred-to provider, care relationship, consult reason, ServiceRequest, organization identity, or encounter context?
6. Which of these use cases can be handled through automated policy selection today?
7. Which require ROI/legal/privacy review before release?
8. Are there use cases where the requester organization is enough, versus use cases where an individual practitioner's role or identity is required?

### 8. Requester Identity and Organization Matching

1. What identifiers does your organization use to recognize requesting organizations: NPI, OID, URL, TEFCA/QHIN directory identifier, UDAP certificate subject, payer identifier, internal trading partner ID, or something else?
2. Are name, address, and contact fields used for matching, human review, audit, troubleshooting, or not at all?
3. Does the trust framework or network provide an authoritative directory of requesters?
4. If a request is routed through an intermediary, how do you preserve the identity of the original requester?
5. What anti-tampering, signature, audit, or contractual protections are required when intermediaries are involved?
6. Do you need to know both the requester and the software client presenting the request?
7. If the client is a platform acting on behalf of multiple requesters, what additional controls are required?

### 9. External Issuer Trust

1. What types of organizations could your health system trust to issue a Permission Ticket for patient self-access?
2. What types could be trusted for delegated/proxy access?
3. What types could be trusted for public health, payer, research, or provider-consult requests?
4. Would trust require a contract, participation agreement, trust-framework membership, certification, accreditation, insurance, indemnification, audit right, or technical conformance testing?
5. What due diligence would be required before trusting an issuer?
6. Would different ticket types require different issuer qualifications?
7. What issuer mistakes would create unacceptable risk for the Data Holder?
8. What logs or artifacts would your organization need for audit or later dispute resolution?
9. Would your organization need revocation checking for tickets, and under what circumstances?
10. How long would revocation information need to remain available for long-lived or derived access?

### 10. Subject Matching and Identity Evidence

1. What patient demographics are minimally required to match a subject to a local record?
2. Are identifiers such as MRN, payer member ID, national identifier, phone, email, or address used in matching?
3. Can a ticket include a direct local record reference or identifier as a matching hint?
4. What happens when there are zero matches, weak matches, or multiple candidate matches?
5. Are ambiguous matches routed to manual review, patient sign-in, or outright denial?
6. Would an embedded IAL2 identity token help with patient matching?
7. What ID-token claims would be required or useful?
8. Would an mDL or verifiable credential be useful if a future profile defined a shape for it?
9. Are there identity evidence issuers your organization already trusts?
10. Does your organization require a local patient account before using externally asserted identity evidence?

### 11. Data Holder, Custodian, and Shared Endpoint Boundaries

1. If a patient selects a specific hospital, clinic, or facility, can your systems limit API data to that entity's records?
2. When multiple facilities share an integrated chart, is data attributed reliably enough to filter by facility or custodian?
3. Are there legal entities that share a technical endpoint but should not answer for each other?
4. Are there contractual or governance rules about which entity is authorized to respond?
5. Are organization filters evaluated at the endpoint level, legal-entity level, facility level, or resource level?
6. Would a ticket naming one organization authorize a broader shared Data Holder to respond?
7. If the disclosure boundary may be broader than the patient-facing facility label, how should the patient or requester be warned?
8. Are there existing directory sources that can tell an issuer which endpoints serve which organizations?

### 12. Audit, Logging, and Dispute Handling

1. What facts must be logged when data is released based on an external authorization artifact?
2. Do logs need to include issuer, requester, presenter/client, subject matching facts, ticket ID, access scope, legal basis, relationship, sensitivity decisions, and resource filters?
3. How long must ticket-related audit data be retained?
4. Who would investigate a later complaint that access was improper?
5. What information would the Data Holder need from the issuer during an investigation?
6. What information should not be stored in the ticket itself but should remain available from the issuer?
7. Are there patient-facing accounting-of-disclosures or access-history implications?

### 13. Operational and Implementation Constraints

1. Which decisions can your current EHR enforce automatically at API response time?
2. Which decisions are only available in portal workflows?
3. Which decisions are only available in ROI/manual workflows?
4. Which policy inputs are structured, and which are buried in documents, notes, local configuration, or staff judgment?
5. How much variation exists across customers, facilities, states, service lines, or affiliated organizations?
6. What would be easy to pilot in the next year?
7. What would require new vendor features, new legal policy, new workflow design, or new trust-framework governance?
8. What ticket fields would be useful immediately even if they are only logged or routed to manual review?
9. What ticket fields would be dangerous because they imply enforceability that does not exist?

### 14. Responsibility Split and Trust Agreement Design

1. For each use case, which facts should an issuer verify once so that responders do not need to re-verify them?
2. Which facts must still be checked locally by each Data Holder even when the issuer is trusted?
3. Which facts should be sent in the ticket because they are needed for automated policy selection?
4. Which facts should be retained by the issuer and made available only for audit, dispute, or investigation?
5. Which facts should be defined only in a trust agreement rather than represented as ticket fields?
6. What would your organization need a trust agreement to say before relying on an issuer's attestation?
7. Should trust be ticket-type-specific? For example, could an issuer be trusted for patient self-access but not delegated access, or for public health but not research?
8. What minimum verification steps should an issuer perform for patient self-access?
9. What minimum verification steps should an issuer perform for delegated/proxy access?
10. What minimum verification steps should an issuer perform for B2B use cases such as public health, payer, research, or provider consult?
11. What evidence should the issuer retain for each verification step, and for how long?
12. What audit rights should responders have if they later question a release?
13. What liability, indemnification, or dispute-resolution terms would be needed to make reliance practical?
14. Should the trust framework define standard authorization-basis categories so responders can map them to local policy?
15. Should the trust framework define minimum claim sets for each ticket type?
16. What information would be enough for a responder to route a request to the right local policy without seeing the full underlying documentation?
17. What information would be too sensitive, too variable, or too operationally fragile to put in a ticket?
18. Where is the best place to handle state-law variation: issuer workflow, ticket profile, trust agreement, responder-local policy, or a combination?
19. What should happen when an issuer's attestation is valid under the trust framework but the responder's local system cannot enforce the requested constraints?
20. What design would materially reduce burden for patients and hospitals, rather than just shifting manual review from the responder to the issuer or client?

## Specific Specification Decisions We Are Trying to Inform

The answers to these questions will inform whether the SMART Permission Tickets specification should:

1. Keep delegated-access authorization basis as an issuer-attested fact only, or define a machine-readable claim for it.
2. Require specific relationship/authority codings for proxy access profiles.
3. Define identity-evidence requirements in the base specification or only in individual profiles.
4. Define future mDL or verifiable credential evidence shapes.
5. Keep sensitive-data handling outside the base kernel, or define profile-specific vocabulary-based controls.
6. Define stronger rules for Data Holder/custodian organization filters.
7. Require particular audit fields or revocation semantics for long-lived tickets.
8. Treat public health, payer, research, and provider-consult use cases as stable profiles or experimental profiles.
9. Define a clearer separation between ticket fields, issuer-retained evidence, trust-framework obligations, and responder-local decisions.
10. Recommend model trust-agreement terms for issuer qualification, responder reliance, audits, revocation, and incident response.

## Suggested Response Format

For each topic you can address, please provide:

- A short description of current practice.
- Whether the practice applies to portal, API, ROI, or all channels.
- Whether the decision is automated, manual, or mixed.
- What facts must be present to make the decision.
- What facts can be accepted from an external issuer.
- What facts must be verified locally.
- Any categories that vary materially by state, facility, legal entity, or patient population.
- Any concerns about exposing the policy category to the requester.
- Any examples of fields, codes, documents, or audit entries that are useful to represent the decision.

If possible, please identify one or two follow-up contacts who understand the operational implementation behind the legal policy, such as privacy operations, HIM/ROI leadership, patient portal access governance, or EHR security/access-control configuration owners.
