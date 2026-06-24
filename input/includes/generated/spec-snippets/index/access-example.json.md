```json
{
  "access": {
    "fhir_resources": [
      {
        "type": "Observation",
        "interactions": [
          "read",
          "search"
        ],
        "category": {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "laboratory"
        }
      },
      {
        "type": "Observation",
        "interactions": [
          "read",
          "search"
        ],
        "code": {
          "system": "http://loinc.org",
          "code": "4548-4"
        }
      },
      {
        "type": "Condition",
        "interactions": [
          "read",
          "search"
        ]
      }
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
