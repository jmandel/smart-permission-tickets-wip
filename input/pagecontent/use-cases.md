## Detailed Use Case Catalog

Here are seven scenarios demonstrating how FHIR resources are used to model diverse authorization needs.

### Use Case 1: Network-Mediated Patient Access
*A patient uses a high-assurance Digital ID wallet to authorize an app to fetch their data from multiple hospitals.*

*   **Subject:** The Patient (Matched by Demographics).
*   **Actor:** (Implicitly the App/Patient).
*   **Constraint:** Granular scope (Immunizations only).

{% include signed-tickets/uc1-ticket.html %}

### Use Case 2: Authorized Representative (Proxy)
*An adult daughter accesses her elderly mother's records. The relationship is verified by a Trust Broker, not the Hospital.*

*   **Subject:** The Mother (`Patient`).
*   **Actor:** The Daughter (`RelatedPerson`).

{% include signed-tickets/uc2-ticket.html %}

### Use Case 3: Public Health Investigation
*A Hospital creates a Case Report. The Public Health Agency (PHA) uses the report as a ticket to query for follow-up data.*

*   **Subject:** The Patient.
*   **Actor:** The Public Health Agency (`Organization`).
*   **Context:** The specific Case ID.

{% include signed-tickets/uc3-ticket.html %}

### Use Case 4: Social Care (CBO) Referral
*A transactional/ad-hoc user. A Food Bank volunteer needs to update a referral status. She does not have an NPI or a user account.*

*   **Subject:** The Patient.
*   **Actor:** A Volunteer (`PractitionerRole`) with identity embedded via **FHIR `contained`**.

{% include signed-tickets/uc4-ticket.html %}

### Use Case 5: Payer Claims Adjudication
*A Payer requests clinical documents to support a specific claim.*

*   **Actor:** The Payer (`Organization`).
*   **Context:** The Claim ID.

{% include signed-tickets/uc5-ticket.html %}

### Use Case 6: Research Study
*A patient consents to a study. The ticket proves consent exists without requiring the researcher to be a "user" at the hospital.*

*   **Actor:** The Research Institute (`Organization`).
*   **Context:** Research Study + Consent Evidence.

{% include signed-tickets/uc6-ticket.html %}

### Use Case 7: Provider-to-Provider Consult
*A Specialist (Practitioner) requests data from a Referring Provider.*

*   **Actor:** The Specialist (`Practitioner`).

{% include signed-tickets/uc7-ticket.html %}
