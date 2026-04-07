```json
{
  "access": {
    "permissions": [
      {
        "kind": "data",
        "resource_type": "Condition",
        "interactions": [
          "read",
          "search"
        ]
      },
      {
        "kind": "data",
        "resource_type": "Procedure",
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
    "responder_filter": [
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
              "value": "1234567890"
            }
          ],
          "name": "General Hospital"
        }
      }
    ],
    "sensitive_data": "exclude"
  }
}
```
