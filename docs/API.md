# API Documentation

DefCat DeckVault API Reference

**Base URL:** `https://defcat.netlify.app/api` (production)
**Base URL:** `http://localhost:8888/api` (development)

## Authentication

Most API endpoints require authentication via Bearer token in the Authorization header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Getting an Access Token

Access tokens are obtained through the Patreon OAuth flow:

1. Navigate to `/auth/login`
2. Click "Login with Patreon"
3. Complete Patreon authorization
4. Token is automatically stored in session cookies

### Role-Based Access

Endpoints are protected by role hierarchy:
- `user` (0) - Basic authenticated user
- `member` (1) - Patreon subscriber
- `moderator` (2) - Content moderator
- `admin` (3) - Administrator
- `developer` (4) - Full system access

---

## Public Endpoints

### Health Check

Check API health status and service availability.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T12:00:00.000Z",
  "services": {
    "database": "healthy",
    "auth": "healthy",
    "storage": "healthy"
  }
}
```

**Status Codes:**
- `200` - All services healthy
- `503` - One or more services degraded

---

### Metrics

Prometheus-compatible metrics endpoint.

**Endpoint:** `GET /api/metrics`

**Response:** Plain text Prometheus format
```
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234

# TYPE memory_usage_bytes gauge
memory_usage_bytes 123456789

# TYPE process_uptime_seconds gauge
process_uptime_seconds 3600
```

**Status Codes:**
- `200` - Success

---

### Card Image Proxy

Retrieve card images with caching.

**Endpoint:** `GET /api/card-image?name={cardName}&size={size}&face={face}`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Exact card name |
| `size` | string | No | Image size: `png`, `art`, `lg`, `md`, `sm` (default: `art`) |
| `face` | string | No | Card face: `front`, `back` (default: `front`) |

**Example:**
```http
GET /api/card-image?name=Lightning Bolt&size=lg&face=front
```

**Response:** Binary image data (PNG/JPEG)

**Status Codes:**
- `200` - Image found and returned
- `404` - Card not found
- `400` - Invalid parameters
- `500` - Server error

---

## Submission Endpoints

### Submit Deck

Submit a deck for review and approval.

**Endpoint:** `POST /api/submit-deck`

**Authentication:** Required (`user` role)

**Request Body:**
```json
{
  "moxfield_url": "https://www.moxfield.com/decks/abc123",
  "email": "user@example.com",
  "bracket": "cedh",
  "comments": "My best deck"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `moxfield_url` | string | Yes | Valid Moxfield deck URL |
| `email` | string | Yes | Contact email address |
| `bracket` | string | Yes | Deck bracket: `bracket1` through `bracket5`, `cedh`, `wild` |
| `comments` | string | No | Additional comments (max 500 chars) |

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": "abc-123-def",
    "status": "pending",
    "credits_remaining": 2
  }
}
```

**Status Codes:**
- `201` - Submission created successfully
- `400` - Invalid input (validation error)
- `401` - Not authenticated
- `403` - Insufficient credits
- `429` - Rate limit exceeded
- `500` - Server error

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid Moxfield URL",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "moxfield_url"
    }
  }
}
```

---

### Submit Roast Request

Request a deck critique ("roast") from DefCat.

**Endpoint:** `POST /api/submit-roast`

**Authentication:** Required (`user` role)

**Request Body:**
```json
{
  "moxfield_url": "https://www.moxfield.com/decks/abc123",
  "email": "user@example.com",
  "comments": "Please be gentle"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `moxfield_url` | string | Yes | Valid Moxfield deck URL |
| `email` | string | Yes | Contact email address |
| `comments` | string | No | Special requests (max 500 chars) |

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": "roast-456",
    "status": "pending",
    "credits_remaining": 4
  }
}
```

**Status Codes:**
- `201` - Roast request created
- `400` - Invalid input
- `401` - Not authenticated
- `403` - Insufficient credits
- `500` - Server error

---

## Admin Endpoints

All admin endpoints require authentication and appropriate role (`admin`, `moderator`, or `developer`).

### List Users

Get paginated list of users.

**Endpoint:** `GET /api/admin/users?page={page}&limit={limit}`

**Authentication:** Required (`admin` role)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Results per page (default: 50, max: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "role": "member",
        "patreon_tier": "Knight",
        "created_at": "2025-01-01T00:00:00.000Z",
        "credits": {
          "roast": 5,
          "deck": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Insufficient permissions
- `500` - Server error

---

### Add User

Manually create a user account.

**Endpoint:** `POST /api/admin/users/add`

**Authentication:** Required (`admin` role)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "user",
  "patreon_tier": "Citizen"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `role` | string | No | User role (default: `user`) |
| `patreon_tier` | string | No | Patreon tier (default: `Citizen`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "newuser@example.com",
    "role": "user"
  }
}
```

**Status Codes:**
- `201` - User created
- `400` - Invalid input
- `401` - Not authenticated
- `403` - Insufficient permissions
- `409` - User already exists
- `500` - Server error

---

### Update User Role

Change a user's role.

**Endpoint:** `POST /api/admin/users/update-role`

**Authentication:** Required (`admin` or `moderator` role)

**Request Body:**
```json
{
  "user_id": "uuid",
  "role": "moderator"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | Yes | User UUID |
| `role` | string | Yes | New role: `user`, `member`, `moderator`, `admin`, `developer` |

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "role": "moderator",
    "updated_at": "2025-10-31T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Role updated
- `400` - Invalid input
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - User not found
- `500` - Server error

---

### Manage Submissions

Get, approve, or reject deck/roast submissions.

**Endpoint:** `GET /api/admin/submissions?status={status}&type={type}`

**Authentication:** Required (`admin` or `moderator` role)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `pending`, `approved`, `rejected` |
| `type` | string | No | Filter by type: `deck`, `roast` |

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "type": "deck",
        "moxfield_url": "https://www.moxfield.com/decks/abc123",
        "email": "user@example.com",
        "status": "pending",
        "bracket": "cedh",
        "comments": "My best deck",
        "submitted_at": "2025-10-31T10:00:00.000Z",
        "submitted_by": "uuid"
      }
    ],
    "total": 42
  }
}
```

---

**Approve/Reject Submission**

**Endpoint:** `PATCH /api/admin/submissions/{id}`

**Request Body:**
```json
{
  "status": "approved",
  "reviewer_notes": "Great deck!"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New status: `approved`, `rejected` |
| `reviewer_notes` | string | No | Internal notes |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "reviewed_at": "2025-10-31T12:00:00.000Z",
    "reviewed_by": "uuid"
  }
}
```

**Status Codes:**
- `200` - Status updated
- `400` - Invalid input
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Submission not found
- `500` - Server error

---

### Import Decks

Bulk import decks from Moxfield.

**Endpoint:** `POST /api/admin/decks/import`

**Authentication:** Required (`admin` role)

**Request Body:**
```json
{
  "deck_ids": ["abc123", "def456", "ghi789"],
  "overwrite": false
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deck_ids` | string[] | Yes | Array of Moxfield deck IDs |
| `overwrite` | boolean | No | Overwrite existing decks (default: `false`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 3,
    "skipped": 0,
    "errors": []
  }
}
```

**Status Codes:**
- `200` - Import completed (check details for partial failures)
- `400` - Invalid input
- `401` - Not authenticated
- `403` - Insufficient permissions
- `500` - Server error

---

### Manage Products

CRUD operations for Patreon tier products.

**Endpoint:** `GET /api/admin/products`

**Authentication:** Required (`admin` or `moderator` role)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "tier": "Knight",
        "name": "Knight Tier",
        "price": 10.00,
        "credits": {
          "roast": 3,
          "deck": 2
        },
        "features": ["Feature 1", "Feature 2"],
        "is_active": true
      }
    ]
  }
}
```

---

**Create Product**

**Endpoint:** `POST /api/admin/products`

**Request Body:**
```json
{
  "tier": "NewTier",
  "name": "New Tier Name",
  "price": 50.00,
  "credits": {
    "roast": 10,
    "deck": 5
  },
  "features": ["Feature 1", "Feature 2"],
  "link": "https://patreon.com/...",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tier": "NewTier",
    "created_at": "2025-10-31T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Product created
- `400` - Invalid input
- `401` - Not authenticated
- `403` - Insufficient permissions
- `409` - Tier already exists
- `500` - Server error

---

### Site Configuration

Manage site-wide configuration settings.

**Endpoint:** `GET /api/admin/site-config`

**Authentication:** Required (`admin` role)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "maintenance_mode",
      "value": "false",
      "category": "general",
      "is_sensitive": false
    },
    {
      "key": "max_submissions_per_hour",
      "value": "10",
      "category": "limits",
      "is_sensitive": false
    }
  ]
}
```

---

**Add Configuration**

**Endpoint:** `POST /api/admin/site-config/add`

**Request Body:**
```json
{
  "key": "new_feature_enabled",
  "value": "true",
  "category": "features",
  "is_sensitive": false
}
```

---

**Update Configuration**

**Endpoint:** `PUT /api/admin/site-config/{key}`

**Request Body:**
```json
{
  "value": "new_value"
}
```

---

**Delete Configuration**

**Endpoint:** `DELETE /api/admin/site-config/{key}`

**Response:**
```json
{
  "success": true,
  "message": "Configuration deleted"
}
```

**Status Codes:**
- `200` - Configuration updated/deleted
- `201` - Configuration created
- `400` - Invalid input
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Configuration not found
- `500` - Server error

---

## Developer Endpoints

These endpoints are restricted to users with the `developer` role.

### Developer Tools

**Spoof Tier:**
`POST /api/admin/developer/spoof-tier`

Temporarily change a user's tier for testing.

**Reset Tier:**
`POST /api/admin/developer/reset-tier`

Reset a user's tier to their actual Patreon tier.

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field": "additional_context"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `DATABASE_ERROR` | Database operation failed |
| `EXTERNAL_API_ERROR` | External API call failed |
| `SERVER_ERROR` | Internal server error |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `429` | Too Many Requests |
| `500` | Internal Server Error |
| `503` | Service Unavailable |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Public endpoints:** 60 requests per minute
- **Authenticated endpoints:** 120 requests per minute
- **Admin endpoints:** 300 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1635724800
```

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later.",
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "retry_after": 30
    }
  }
}
```

---

## Webhooks (Future)

Webhook support is planned for future releases to notify external systems of events like:
- Deck approval
- New submissions
- Tier changes
- Credit updates

---

## SDK and Client Libraries

**Official SDKs:** Coming soon

**Community Libraries:**
- JavaScript/TypeScript: Use fetch or axios
- Python: Use requests library
- Go: Use net/http package

**Example (TypeScript):**
```typescript
const response = await fetch('https://defcat.netlify.app/api/submit-deck', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    moxfield_url: 'https://www.moxfield.com/decks/abc123',
    email: 'user@example.com',
    bracket: 'cedh',
    comments: 'My best deck'
  })
})

const data = await response.json()
if (data.success) {
  console.log('Submission ID:', data.data.submission_id)
} else {
  console.error('Error:', data.error.message)
}
```

---

## Support

For API support and questions:
- Create an issue on GitHub
- Email: [Your Support Email]
- Discord: [Your Discord Server]

---

**Last Updated:** 2025-10-31
**API Version:** 0.1.0
