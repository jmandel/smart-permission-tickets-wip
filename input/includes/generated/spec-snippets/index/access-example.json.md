```json
{
  "access": {
    "smart_scopes": [
      "patient/Observation.rs?category=http://terminology.hl7.org/CodeSystem/observation-category|laboratory",
      "patient/Observation.rs?code=http://loinc.org|4548-4",
      "patient/Condition.rs"
    ],
    "data_period": {
      "start": "2023-01-01",
      "end": "2024-12-31"
    },
    "data_holder_filter": [
      {
        "kind": "jurisdiction",
        "address": {
          "state": "CA"
        }
      },
      {
        "kind": "jurisdiction",
        "address": {
          "state": "NY"
        }
      },
      {
        "kind": "organization",
        "organization": {
          "resourceType": "Organization",
          "identifier": [
            {
              "system": "http://hl7.org/fhir/sid/us-npi",
              "value": "123"
            }
          ]
        }
      }
    ]
  }
}
```
