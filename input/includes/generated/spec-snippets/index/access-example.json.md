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
    "jurisdictions": [
      {
        "country": "US",
        "state": "CA"
      },
      {
        "country": "US",
        "state": "NY"
      }
    ],
    "source_organizations": [
      {
        "system": "http://hl7.org/fhir/sid/us-npi",
        "value": "1234567890"
      }
    ],
    "sensitive_data": "exclude"
  }
}
```
