This page lists the current `ticket_type` registry for the seven core Permission Ticket use cases.

{% include generated/spec-snippets/index/use-case-profile-map.md %}

#### Per-Profile Constraints

The table below summarizes required and optional fields for each ticket type:

| Use Case | `presenter_binding` | Requester | Context Fields | Access Dimensions |
|----------|---------------------|-----------|--------------|-------------------|-------------------|
| UC1: Patient Self Access | Required unless self-issued presenter rule applies | — | *(none)* | `permissions` (required) |
| UC2: Patient-Delegated Access | Optional | `RelatedPerson` (required) | *(none)* | `permissions` (required) |
| UC3: Public Health | Optional | `Organization` (required) | `reportable_condition` | `permissions`, `data_period`, `data_holder_filter` |
| UC4: Social Care | Optional | `Organization` (required) | `concern`, `referral` | `permissions` |
| UC5: Payer Claims | Optional | `Organization` (required) | `service`, `claim` | `permissions`, `data_period`, `data_holder_filter` |
| UC6: Research | Optional | `Organization` (required) | `study` | `permissions`, `data_period` |
| UC7: Provider Consult | Optional | `PractitionerRole` (required) | `reason`, `consult_request` | `permissions` |

#### Use Case 1: Patient Self Access
*A patient uses a high-assurance Digital ID wallet to authorize an app to fetch their data from multiple hospitals.*

##### Ticket Schema
*   **Subject:** `Patient` (matched by demographics: Name, DOB, Identifier).
*   **Requester:** None (self-access).
*   **Identity evidence:** Profiles may require `subject_identity_evidence`; see [Proposal 004](proposal-004-embedded-identity-evidence.html) for embedded IAL2 evidence.
*   **Context:** *(none; `context` may be omitted or empty for this ticket type)*.
*   **Access:** `permissions` with specific resource types and interactions.

{% include generated/signed-tickets/uc1-ticket.html %}

#### Use Case 2: Patient-Delegated Access
*An adult daughter accesses her elderly mother's records. The relationship is verified by a Trusted Issuer, not the Hospital.*

##### Ticket Schema
*   **Subject:** `Patient` (matched by demographics or identifier).
*   **Requester:** `RelatedPerson` with relationship codings expressing both personal relationship and legal authority type.
*   **Context:** *(none; same as UC1 — delegation is expressed by the presence and type of `requester`)*
*   **Access:** `permissions` with specific resource types and interactions.

{% include generated/signed-tickets/uc2-ticket.html %}

#### Use Case 3: Public Health Investigation
*A Hospital creates a Case Report. The Public Health Agency (PHA) uses a ticket to query for follow-up data.*

##### Ticket Schema
*   **Subject:** `Patient` (matched by demographics or identifier).
*   **Requester:** `Organization` (public health agency).
*   **Context:** `reportable_condition` (coded condition).
*   **Access:** `permissions`, optional `data_period`, `data_holder_filter`, `sensitive_data`.

{% include generated/signed-tickets/uc3-ticket.html %}

#### Use Case 4: Social Care (CBO) Referral
*A community-based organization needs to access referral-related data. A Food Bank volunteer needs to update a referral status.*

##### Ticket Schema
*   **Subject:** `Patient` (matched by demographics or identifier).
*   **Requester:** `Organization` (social care hub).
*   **Context:** `concern` (coded concern), `referral` (ServiceRequest).
*   **Access:** `permissions` with specific resource types and interactions.

{% include generated/signed-tickets/uc4-ticket.html %}

#### Use Case 5: Payer Claims Adjudication
*A Payer requests clinical documents to support a specific claim.*

##### Ticket Schema
*   **Subject:** `Patient` (matched by demographics or identifier).
*   **Requester:** `Organization` (Payer).
*   **Context:** `service` (coded service), `claim` (Claim resource).
*   **Access:** `permissions`, optional `data_period`, `data_holder_filter`.

{% include generated/signed-tickets/uc5-ticket.html %}

#### Use Case 6: Research Study
*A patient consents to a study. The ticket proves consent exists without requiring the researcher to be a "user" at the hospital.*

##### Ticket Schema
*   **Subject:** `Patient` (matched by demographics or identifier).
*   **Requester:** `Organization` (research institute).
*   **Context:** `study` (ResearchStudy resource).
*   **Access:** `permissions`, optional `data_period`, `sensitive_data`.

{% include generated/signed-tickets/uc6-ticket.html %}

#### Use Case 7: Provider-to-Provider Consult
*A Specialist (Practitioner) requests data from a Referring Provider.*

##### Ticket Schema
*   **Subject:** `Patient` (matched by demographics or identifier).
*   **Requester:** `PractitionerRole` (specialist role).
*   **Context:** `reason` (coded reason), `consult_request` (ServiceRequest).
*   **Access:** `permissions` with specific resource types and interactions.

{% include generated/signed-tickets/uc7-ticket.html %}
