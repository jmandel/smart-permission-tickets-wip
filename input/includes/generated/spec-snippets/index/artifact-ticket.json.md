```json
{
  "iss": "https://trust-broker.org",
  "sub": "issuer-defined-subject",
  "aud": "https://network.org",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/proxy-v1",
  "client_binding": {
    "jwks_uri": "https://app.client.id/jwks.json"
  },
  "ticket_context": {
    "subject": {
      "resourceType": "Patient"
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
