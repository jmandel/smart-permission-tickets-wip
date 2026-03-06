```json
{
  "authorization": {
    "subject": {
      "type": "identifier",
      "resourceType": "Patient",
      "identifier": [
        {
          "value": "MRN-123"
        }
      ]
    },
    "requester": {
      "resourceType": "Organization",
      "name": "Oncology Research Institute",
      "identifier": [
        {
          "value": "research-org-id"
        }
      ]
    },
    "access": {
      "scopes": [
        "patient/*.rs"
      ],
      "periods": [
        {
          "start": "2020-01-01",
          "end": "2025-01-01"
        }
      ]
    }
  },
  "details": {
    "condition": {
      "system": "http://snomed.info/sct",
      "code": "363358000",
      "display": "Malignant tumor of lung"
    },
    "study": {
      "identifier": {
        "system": "https://clinicaltrials.gov",
        "value": "NCT-12345"
      },
      "display": "Lung cancer immunotherapy trial"
    }
  }
}
```
