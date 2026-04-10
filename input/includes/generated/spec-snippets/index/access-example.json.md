```json
{
  "access": {
    "permissions": [
      {
        "kind": "data",
        "resource_type": "Observation",
        "interactions": [
          "read",
          "search"
        ],
        "category_any_of": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "laboratory"
          },
          {
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "vital-signs"
          }
        ],
        "code_any_of": [
          {
            "system": "http://loinc.org",
            "code": "718-7"
          },
          {
            "system": "http://loinc.org",
            "code": "4548-4"
          }
        ]
      },
      {
        "kind": "data",
        "resource_type": "Condition",
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
          "country": "US",
          "state": "CA"
        }
      },
      {
        "kind": "jurisdiction",
        "address": {
          "country": "US",
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
    ],
    "sensitive_data": "exclude"
  }
}
```
