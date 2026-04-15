{% include callouts.html %}

**Status:** Draft for discussion \| **Author:** Josh Mandel \| **Date:** April 15, 2026

### Summary

The current spec defines backend token exchange as the sole redemption path for permission tickets. This proposal adds an optional fallback where a Data Holder can signal that it needs direct patient interaction before issuing an access token, triggering a standard SMART App Launch flow. The fallback leverages SMART App Launch's "EHR Launch" flow.

### Motivation

Permission tickets are designed so the patient authorizes once, with the issuer, and the ticket carries that authorization forward to many Data Holders without repeating the process. Backend token exchange is the right primary path — it's non-interactive, works for B2B and patient access alike, and scales to many Data Holders without per-site friction.

However, there are cases where the information in the ticket is genuinely insufficient for the Data Holder to complete the request silently:

- **Patient identity could not be resolved.** The ticket's `subject.patient` demographics do not match any local record, or match multiple candidates with insufficient confidence to select one. The patient needs to help the Data Holder identify the right record.
- **TODO: Other cases?**

The ticket still carries the full authorization context; the interactive step fills a specific informational gap that only the patient can resolve.

Today, the Data Holder's only option in these cases is to reject the token exchange with `invalid_grant`, which gives the client no path forward. The patient's authorization intent (captured in the ticket) is lost.

> **What this fallback is not for.** The `interaction_required` response is not an invitation to impose additional consent capture ceremonies, step-up authentication, first-time disclosure agreements, or other friction beyond what the ticket and issuer trust already provide. If a Data Holder does not trust the issuer's verification, it should reject the ticket with `invalid_grant`. The fallback exists for cases where the Data Holder trusts the ticket but cannot act on it without the patient's help resolving a specific local gap.
{: .callout .callout-info}

### Proposal

#### 1. Token exchange remains the default path

Backend token exchange remains the primary and default redemption path for all ticket types. Nothing changes for the common case. Clients present the permission ticket via RFC 8693 token exchange and receive an access token.

#### 2. `interaction_required` error response

Data Holders MAY respond to a token exchange request with `interaction_required` indicating that patient interaction is needed.

```json
{
  "error": "interaction_required",
  "launch": "ctx-abc123"
}
```

| Field | Description |
|---|---|
| `error` | `interaction_required` — the Data Holder trusts the ticket but cannot complete the token exchange without patient interaction |
| `launch` | A launch ID that the Data Holder has associated with the original token exchange request (including the cached permission ticket) on the backend |

The Data Holder caches the permission ticket from the failed token exchange and links it to the `launch` value internally. No ticket retransmission is needed in subsequent steps.

#### 3. Client initiates SMART EHR Launch

The client initiates a standard SMART EHR Launch using the provided `launch` value. The client already knows the Data Holder's authorize endpoint from `.well-known/smart-configuration` discovery.

```
GET /authorize?
  response_type=code
  &client_id=well-known:https://app.example.com
  &redirect_uri=https://app.example.com/callback
  &scope=patient/Observation.rs
  &launch=ctx-abc123
  &aud=https://fhir.hospital.com/fhir
```

From this point forward, the flow follows the existing SMART App Launch specification. The Data Holder presents whatever interaction is needed to resolve the specific gap, issues an authorization code, and redirects back. The client exchanges the code for an access token through the standard code exchange.

The Data Holder resolves the `launch` parameter to the cached permission ticket and applies the ticket's access constraints when issuing the resulting access token. The same intersection logic applies as in the silent token exchange path: granted access is the intersection of requested scopes, ticket `access.permissions`, and client registration.

#### 4. Sign-in MAY be required

When the Data Holder cannot resolve the patient from the ticket's `subject.patient` claims alone, sign-in may be required. The ticket still carries the full authorization context (scopes, data period, data holder filters, sensitive data policy, requester, presenter binding). Sign-in supplements identity resolution. The patient does not need to re-express any sharing preferences; those are already captured in the ticket.

#### 5. Data Holders SHOULD cache resolved interactions

Once the Data Holder has resolved the local gap for a given ticket (keyed by `jti`), subsequent token exchange requests using the same ticket SHOULD succeed silently without repeating the interactive flow. The patient goes through the interactive step at most once per Data Holder per ticket.

#### 6. B2B tickets: not applicable

For B2B ticket types (UC3–UC7), `interaction_required` SHOULD NOT be returned. There is no patient present to interact with. If a Data Holder cannot process a B2B ticket silently, it should reject with `invalid_grant` and an appropriate `error_description`.

### Design Rationale

*Why not make authorization code flow the primary path for patient access?* Because the core value of permission tickets is eliminating per-site authorization friction. A patient pulling records from eight hospitals should not go through eight redirect loops. The default must be silent. The fallback exists for the exception, not the rule.

*Why reuse SMART EHR Launch rather than invent a new interaction mechanism?* Every certified EHR already supports SMART App Launch and every SMART client already knows how to do it. The only new client-side logic is recognizing the `interaction_required` error code and extracting the `launch` parameter. Everything else — the redirect, the authorization code exchange, scope negotiation — is existing behavior. Clients that cannot handle redirects (e.g., background batch clients) can simply treat `interaction_required` as an error and move on to the next Data Holder.

*Why is sign-in acceptable in the fallback?* The primary flow succeeds when the ticket's `subject.patient` demographics are sufficient for the Data Holder to resolve to a unique local record. When they're not — multiple candidates, no match with sufficient confidence — someone has to disambiguate. The ticket carried the authorization; sign-in fills the identity gap. The patient benefits from the ticket because they don't need to re-authorize; they just need to help the Data Holder find the right record.

*Relationship to presenter binding.* For UC1/UC2, `presenter_binding` is required. The ticket is cryptographically bound to the client's key regardless of whether redemption goes through token exchange or the SMART Launch fallback. The security properties hold in both paths.

