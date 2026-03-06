```json
{
  "iss": "https://trusted-issuer.org",
  "sub": "grant-example-referral",
  "aud": "https://network.org",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/provider-consult-v1",
  "cnf": {
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "authorization": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "reference": "Patient/123"
    },
    "requester": {
      "resourceType": "PractitionerRole"
    },
    "access": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  },
  "details": {
    "reason": {
      "system": "http://snomed.info/sct",
      "code": "49436004",
      "display": "Atrial fibrillation"
    },
    "request": {
      "reference": "ServiceRequest/123",
      "identifier": {
        "system": "https://issuer.org/cases",
        "value": "CASE-123"
      },
      "display": "Cardiology consult for atrial fibrillation"
    }
  }
}
```
