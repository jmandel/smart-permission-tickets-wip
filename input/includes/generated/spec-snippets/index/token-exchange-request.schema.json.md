```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "grant_type": {
      "type": "string",
      "const": "urn:ietf:params:oauth:grant-type:token-exchange"
    },
    "subject_token": {
      "type": "string",
      "minLength": 1
    },
    "subject_token_type": {
      "type": "string",
      "const": "https://smarthealthit.org/token-type/permission-ticket"
    },
    "scope": {
      "type": "string"
    },
    "client_assertion_type": {
      "type": "string",
      "const": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
    },
    "client_assertion": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "grant_type",
    "subject_token",
    "subject_token_type",
    "client_assertion_type",
    "client_assertion"
  ],
  "additionalProperties": false
}
```
