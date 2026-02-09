```json
{
  "ticket_context": {
    "subject": {
      "resourceType": "Patient",
      "id": "local-patient-123"
    },
    "actor": {
      "resourceType": "Organization",
      "name": "State Dept of Health",
      "identifier": [
        {
          "system": "urn:ietf:rfc:3986",
          "value": "https://doh.state.gov"
        }
      ],
      "type": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/organization-type",
              "code": "govt"
            }
          ]
        }
      ]
    },
    "context": {
      "type": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "PUBHLTH",
        "display": "Public Health"
      },
      "focus": {
        "system": "http://snomed.info/sct",
        "code": "56717001",
        "display": "Tuberculosis"
      },
      "identifier": [
        {
          "system": "https://doh.wa.gov/cases",
          "value": "CASE-2024-999"
        }
      ]
    },
    "capability": {
      "scopes": [
        "patient/*.rs"
      ],
      "periods": [
        {
          "start": "2025-01-01",
          "end": "2026-01-01"
        }
      ]
    }
  }
}
```
