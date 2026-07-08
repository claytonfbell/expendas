# API

Add new table ApiKey with columns:

- id
- key
- userId
- created_at (timestamp)

Add new page "/api-keys" in user menu for managing API keys with ability to:

- Create new API key
- Revoke existing API key
- View list of API keys with their creation date

All existing API endpoints should allow authentication via API key in addition to session cookie by including the API key in the `Authorization` header as `Bearer <API_KEY>`. If both are provided, the API key should take precedence.

A new endpoint at "/api/openapi.json" should be added to serve the OpenAPI specification for the API.

Add link from api-keys page to view Rest API documents at "/api-docs". It should display a nice user-friendly interface for exploring and interacting with the API endpoints. A dropdown should allow selecting API keys belonging to the user to test the endpoints.
