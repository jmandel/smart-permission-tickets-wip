```json
{
  "authorization": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "id": "local-patient-123"
    },
    "requester": {
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
    "access": {
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
  },
  "details": {
    "condition": {
      "system": "http://snomed.info/sct",
      "code": "56717001",
      "display": "Tuberculosis"
    },
    "caseIdentifier": [
      {
        "system": "https://doh.wa.gov/cases",
        "value": "CASE-2024-999"
      }
    ]
  }
}
```
