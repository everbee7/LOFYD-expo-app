# app-mobile-ui — Claude Context

## Purpose

React Native (Expo) mobile app for LOFYD. This file documents the backend API contracts the mobile app depends on — use this to ensure new or modified endpoints don't break the mobile app.

## API Client

- **Base URL**: `EXPO_PUBLIC_API_URL` env var (defaults to `http://localhost:5000/api`)
- **HTTP client**: axios with interceptors (`services/api.ts`)
- **Timeout**: 10 seconds
- **Auth header**: `Authorization: Bearer {idToken}` on all requests except `/auth/refresh-token`

## Endpoints Called

### Auth (`services/auth.ts`)

| Method | Path | Request Body | Response |
|--------|------|-------------|----------|
| POST | `/auth/signup` | `{ email, firstName, lastName, password, postalCode }` | — |
| POST | `/auth/confirm-signup` | `{ email, code }` | — |
| POST | `/auth/login` | `{ email, password }` | `LoginResponse` |
| POST | `/auth/validate-token` | `{ userId, token }` | `LoginResponse` |
| POST | `/auth/refresh-token` | `{ userId, refreshToken }` | `RefreshResponse` |
| POST | `/auth/forgot-password` | `{ email }` | — |
| POST | `/auth/reset-password` | `{ email, code, password }` | — |

### User (`services/auth.ts`)

| Method | Path | Request Body | Response |
|--------|------|-------------|----------|
| GET | `/user/profile` | — | `User` |
| PUT | `/user/profile` | `UserUpdateRequest` | `User` |

### Location (`services/location.ts`)

| Method | Path | Query Params | Response |
|--------|------|-------------|----------|
| GET | `/location` | See filter params below | `LocationListResponse` |
| GET | `/location/{id}` | — | `Location` |
| GET | `/location/tags` | `location`, `coords` | `TagResponse` |
| GET | `/location/search` | `location` | `SearchSuggestion[]` |

### Special (`services/special.ts`)

| Method | Path | Query Params | Response |
|--------|------|-------------|----------|
| GET | `/special` | See filter params below + `locationId` | `SpecialListResponse` |
| GET | `/special/{id}` | — | `Special` |
| GET | `/special/tags` | `location`, `coords` | `TagResponse` |

## Request/Response Shapes

### Auth Types

```typescript
// Login / validate-token response
LoginResponse {
  userId: string
  email: string
  username: string
  firstName: string
  lastName: string
  postalCode: string
  token: {
    accessToken: string
    expiresAt: string
    idToken: string
    refreshToken: string
    tokenType: string
  }
}

// Refresh token response (no refreshToken in response)
RefreshResponse {
  userId: string
  email: string
  token: {
    accessToken: string
    expiresAt: string
    idToken: string
    tokenType: string
  }
}

// User profile
User {
  id: string
  email: string
  firstName: string
  lastName: string
  postalCode: string
  birthDate?: string
  eatOutFrequency?: string
}

// User profile update
UserUpdateRequest {
  id: string
  email: string
  firstName: string
  lastName: string
  postalCode: string
  birthDate?: string
  eatOutFrequency?: string
}
```

### Location/Special Filter Query Parameters

**Required:**
- `coords` — `"{latitude},{longitude}"` (e.g. `"40.7128,-74.0060"`)
- `locationType` — `"locale"` | `"coords"`
- `radiusInMiles` — number
- `sortBy` — `"relevance"` | `"distance"` | `"favorites"`

**Optional (arrays use multiple appends):**
- `location` — string (city/area name, used when locationType is "locale")
- `serviceType[]` — `"dine-in"` | `"take-out"` | `"delivery"`
- `experience[]` — string (e.g. `"casual"`, `"fine-dining"`)
- `cuisine[]` — string (e.g. `"Italian"`, `"Mexican"`)
- `taste[]` — string (e.g. `"spicy"`, `"sweet"`)
- `priceRange[]` — number (1–5 scale)
- `keywords[]` — string
- `offset` — number (pagination)
- `limit` — number (default 20)

### Location Types

```typescript
Location {
  id: string
  name: string
  description: string
  street: string
  city: string
  state: string
  postalCode: string
  phone: string
  coordinates: { latitude: number; longitude: number }
  distFromInMiles: number
  locationHours: Array<{
    day: string
    isClosed: boolean
    times: Array<{ open: string; close: string }>
  }>
  serviceType: string[]
  experience: string[]
  cuisine: string[]
  taste: string[]
  priceRange: number
  images: string[]
  timezone: string
  neighborhood: string
}

LocationListResponse {
  locations: Location[]
  offset: number
  limit: number
  totalSize: number
}

TagResponse {
  experience: string[]
  cuisine: string[]
  taste: string[]
}
```

### Special Types

```typescript
Special {
  id: string
  title: string
  subtitle: string
  terms: string
  locationId: string
  expireDate: string
  // ...plus location fields
}

SpecialListResponse {
  specials: Special[]
  offset: number
  limit: number
  totalSize: number
}
```

## Token Management

Tokens stored in AsyncStorage:
- `idToken` — used in `Authorization: Bearer` header
- `accessToken` — stored but idToken used for requests
- `refreshToken` — used to refresh expired tokens
- `userId` — sent with refresh requests

**Refresh flow:** On 401 with message `"The incoming token has expired"`:
1. Queue all pending requests
2. POST `/auth/refresh-token` with `{ userId, refreshToken }`
3. Update stored tokens
4. Retry queued requests

On refresh failure: clear all tokens → logout → redirect to login.

## Conventions That Affect Backend Design

- **New response fields must be camelCase** — the mobile app accesses fields by name directly
- **Pagination shape must match** `{ items[], offset, limit, totalSize }` — deviating breaks the location/special list screens
- **Coordinates must always be** `{ latitude, longitude }` — not `lat/lng` or `[lat, lng]`
- **New filter parameters** should follow the existing query param pattern (arrays via multiple appends, not JSON body)
- **New endpoints must return errors** as `{ detail: "..." }` — the axios interceptor reads `error.response.data.error` or `.message`
- **New auth-related endpoints** should be added to `services/auth.ts` on the mobile side

## Key Files

```
services/api.ts          — axios client, interceptors, token refresh
services/auth.ts         — auth + user profile API calls
services/location.ts     — location search + tags
services/special.ts      — specials search + tags
store/authStore.tsx      — auth state, token persistence
store/locationStore.tsx  — search state, filters, pagination, tag cache
types/auth.ts            — User, Token, LoginResponse types
types/location.ts        — Location, Special, filter types
```
