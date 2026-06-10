```json
{
  "iss": "https://trusted-issuer.org",
  "aud": "https://network.org",
  "aud_type": "trust_framework",
  "exp": 1735689600,
  "iat": 1735686000,
  "jti": "ticket-example-001",
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
  "presenter_binding": {
    "method": "jkt",
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "subject": {
    "patient": {
      "resourceType": "Patient",
      "name": [
        {
          "family": "Smith",
          "given": [
            "John"
          ]
        }
      ],
      "birthDate": "1980-01-01",
      "identifier": [
        {
          "system": "http://hospital.example.org/mrn",
          "value": "A12345"
        }
      ]
    }
  },
  "access": {
    "permissions": [
      {
        "kind": "data",
        "resource_type": "Immunization",
        "interactions": [
          "read",
          "search"
        ]
      },
      {
        "kind": "data",
        "resource_type": "AllergyIntolerance",
        "interactions": [
          "read",
          "search"
        ]
      }
    ]
  }
}
```
