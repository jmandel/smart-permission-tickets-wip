```json
{
  "ticket_context": {
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
            "value": "000-00-0000"
          }
        ]
      }
    },
    "capability": {
      "scopes": [
        "patient/Immunization.rs",
        "patient/AllergyIntolerance.rs"
      ]
    }
  }
}
```
