# SciValidate API Documentation

This document outlines the API structure planned for the SciValidate system. While the API is currently in development, this documentation provides a roadmap for the intended functionality and interfaces that will be available to developers and integrators.

## API Design Philosophy

The SciValidate API is designed around these core principles:

1. **RESTful Architecture**: Standard HTTP methods and status codes for predictable integration
2. **Granular Authorization**: Scoped access tokens that enable precise permission control
3. **Comprehensive Documentation**: Clear documentation with examples for all endpoints
4. **Versioned Endpoints**: Explicit versioning to ensure backward compatibility
5. **Rate Limiting**: Fair usage policies to ensure system stability

## Core API Endpoints

### Researcher Verification API

These endpoints handle researcher identity verification and expertise information:

#### `GET /api/v1/researchers/{id}`

Retrieves detailed information about a verified researcher by their SciValidate ID.

**Parameters:**

- `id` (path): The SciValidate identifier for the researcher

**Response:**

```json
{
  "id": "r-12345",
  "name": {
    "given": "Jane",
    "family": "Smith",
    "display": "Jane A. Smith"
  },
  "identifiers": [
    {
      "type": "orcid",
      "value": "0000-0002-1825-0097",
      "verification_level": "confirmed"
    }
  ],
  "affiliations": [
    {
      "institution": "Rensselaer Polytechnic Institute",
      "department": "Chemistry and Chemical Biology",
      "role": "Professor",
      "verification_level": "confirmed"
    }
  ],
  "expertise": [
    {
      "field": "Organic Chemistry",
      "score": 0.92,
      "publications": 47,
      "citations": 1253
    },
    {
      "field": "Medicinal Chemistry",
      "score": 0.78,
      "publications": 23,
      "citations": 586
    }
  ],
  "metrics": {
    "h_index": 24,
    "i10_index": 36,
    "citations_total": 2517,
    "publications_total": 62
  }
}
```

#### `GET /api/v1/researchers/lookup`

Looks up a researcher by external identifier (ORCID, email, etc.).

**Parameters:**

- `identifier_type` (query): Type of identifier (orcid, email)
- `identifier_value` (query): Value of the identifier

**Response:**
Same format as the direct researcher lookup.

#### `GET /api/v1/researchers/{id}/publications`

Retrieves publications associated with a researcher.

**Parameters:**

- `id` (path): The SciValidate identifier for the researcher
- `page` (query): Page number for pagination
- `limit` (query): Number of results per page (max 100)
- `sort` (query): Sort order (citations, year, title)

**Response:**

```json
{
  "researcher_id": "r-12345",
  "total_count": 62,
  "page": 1,
  "limit": 10,
  "publications": [
    {
      "id": "p-78901",
      "title": "Novel Synthesis of Catalytic Compounds",
      "year": 2023,
      "venue": "Journal of Organic Chemistry",
      "doi": "10.1000/xyz123",
      "citations": 14,
      "author_position": 1,
      "is_corresponding": true
    }
    // Additional publications
  ]
}
```

### Verification Badge API

These endpoints handle the generation and validation of verification badges:

#### `GET /api/v1/badges/generate`

Generates a verification badge for a specific claim or researcher.

**Parameters:**

- `researcher_id` (query): The researcher ID to verify
- `claim_id` (query): Optional specific claim ID
- `format` (query): Badge format (svg, html, json)

**Response:**
SVG, HTML, or JSON representation of the verification badge with embedded verification data.

#### `GET /api/v1/badges/verify/{token}`

Verifies the authenticity of a verification badge.

**Parameters:**

- `token` (path): The verification token embedded in the badge

**Response:**

```json
{
  "valid": true,
  "researcher": {
    "id": "r-12345",
    "name": "Jane A. Smith",
    "expertise": [{ "field": "Organic Chemistry", "score": 0.92 }]
  },
  "claim": {
    "id": "c-56789",
    "content": "The catalytic reaction shows 95% efficiency",
    "consensus_level": "emerging",
    "supporting_evidence": 3
  },
  "timestamp": "2025-02-15T14:32:17Z",
  "verification_url": "https://scivalidate.org/verify/abc123def456"
}
```

### Field and Taxonomy API

These endpoints provide access to the field classification system:

#### `GET /api/v1/fields`

Retrieves the field taxonomy hierarchy.

**Parameters:**

- `parent_id` (query): Optional parent field ID to retrieve children
- `search` (query): Optional search term to filter fields

**Response:**

```json
{
  "fields": [
    {
      "id": "f-100",
      "name": "Chemistry",
      "parent_id": null,
      "children": [
        {
          "id": "f-110",
          "name": "Organic Chemistry",
          "parent_id": "f-100"
        },
        {
          "id": "f-120",
          "name": "Inorganic Chemistry",
          "parent_id": "f-100"
        }
      ]
    }
  ]
}
```

#### `GET /api/v1/fields/{id}/experts`

Retrieves top experts in a specific field.

**Parameters:**

- `id` (path): The field ID
- `limit` (query): Number of experts to return (default 10)

**Response:**

```json
{
  "field": {
    "id": "f-110",
    "name": "Organic Chemistry"
  },
  "experts": [
    {
      "id": "r-12345",
      "name": "Jane A. Smith",
      "expertise_score": 0.92,
      "institution": "Rensselaer Polytechnic Institute",
      "publications_in_field": 47
    }
    // Additional experts
  ]
}
```

## Authentication and Authorization

The SciValidate API uses OAuth 2.0 for authentication and JWT for authorization.

### Authentication Endpoints

#### `POST /api/v1/auth/token`

Generates an access token for API usage.

**Request:**

```json
{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials",
  "scope": "researchers:read badges:generate"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "researchers:read badges:generate"
}
```

### Authorization Scopes

The API supports the following authorization scopes:

- `researchers:read`: Read researcher profiles
- `publications:read`: Read publication data
- `badges:generate`: Generate verification badges
- `badges:verify`: Verify badge authenticity
- `fields:read`: Read field taxonomy information

## Rate Limiting

To ensure fair usage and system stability, the API implements the following rate limits:

- **Anonymous requests**: 10 requests per minute
- **Authenticated requests**: 100 requests per minute per client
- **Badge generation**: 50 requests per minute per client

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1614556800
```

## Error Handling

The API uses standard HTTP status codes and provides detailed error messages:

```json
{
  "error": {
    "code": "not_found",
    "message": "Researcher not found with ID r-99999",
    "status": 404,
    "request_id": "req-abcdef123456"
  }
}
```

## Future API Extensions

The following API extensions are planned for future releases:

1. **Collaboration Network API**: Endpoints for retrieving collaboration graphs and connections between researchers
2. **Consensus API**: Endpoints for assessing scientific consensus on specific topics
3. **Verification Webhook API**: Webhooks for real-time notifications of verification events
4. **Analytics API**: Endpoints for retrieving aggregated metrics and trends

## Requesting API Access

The API is currently in development. If you're interested in early access or integration partnerships, please contact the SciValidate team through the GitHub repository.
