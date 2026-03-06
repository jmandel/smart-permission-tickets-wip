```json
{
  "iss": "https://trust-broker.org",
  "sub": "grant-example-referral",
  "aud": "https://network.org",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/provider-consult-v1",
  "cnf": {
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "ticket_context": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "reference": "Patient/123"
    },
    "actor": {
      "resourceType": "PractitionerRole"
    },
    "context": {
      "type": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "REFER"
      },
      "focus": {
        "system": "http://snomed.info/sct",
        "code": "49436004",
        "display": "Atrial fibrillation"
      },
      "identifier": [
        {
          "system": "https://issuer.org/cases",
          "value": "CASE-123"
        }
      ]
    },
    "capability": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  }
}
```
