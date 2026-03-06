```json
{
  "iss": "https://trusted-issuer.org",
  "sub": "grant-example-patient-access",
  "aud": "https://network.org",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1",
  "cnf": {
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "authorization": {
    "subject": {
      "type": "match",
      "traits": {
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
            "system": "urn:oid:2.16.840.1.113883.4.1",
            "value": "***-**-1234"
          }
        ],
        "telecom": [
          {
            "system": "phone",
            "value": "555-867-5309"
          }
        ],
        "address": [
          {
            "state": "IL"
          }
        ]
      }
    },
    "access": {
      "scopes": [
        "patient/Immunization.rs",
        "patient/AllergyIntolerance.rs"
      ]
    }
  }
}
```
