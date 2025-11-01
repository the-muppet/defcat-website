# Testing Guide

## Overview

This project uses **Vitest** for testing with a pragmatic approach - integration tests with real test users instead of heavy mocking.

## Test Structure

```
src/
├── lib/api/__tests__/          # Unit tests for API utilities
│   └── patreon.test.ts         # Patreon tier determination
├── app/api/submit-deck/__tests__/
│   └── submit-deck.integration.test.ts  # Deck submission API tests
└── app/api/submit-roast/__tests__/
    └── submit-roast.integration.test.ts # Roast submission API tests
```

## Setup for Integration Tests

### 1. Create Test User

Integration tests require a real test user in the database:

```bash
bun run create-test-user
```

This creates:
- **Email**: `test@testing.com`
- **Password**: `password`
- **Role**: `admin`
- **Tier**: `ArchMage`
- **Credits**: Unlimited

### 2. Start Development Server

Integration tests hit real API routes:

```bash
bun run dev
# Server runs on http://localhost:8888
```

### 3. Run Tests

```bash
# Run all tests
bun run test

# Run specific test file
bun run test submit-deck.integration.test.ts

# Run with coverage
bun run test:coverage

# Run with UI
bun run test:ui
```

## Test Categories

### Unit Tests
- **Location**: `src/lib/api/__tests__/`
- **Purpose**: Test pure functions and utilities
- **Mocking**: Minimal - only external APIs
- **Example**: Patreon tier determination logic

### Integration Tests
- **Location**: `src/app/api/*/__tests__/`
- **Purpose**: Test full request/response cycle with real database
- **Mocking**: None - uses real test user and Supabase
- **Example**: Submit-deck and submit-roast endpoints

## What's Tested

### Deck Submission API (`/api/submit-deck`)
✅ Successful submission with valid data
✅ Admin bypasses tier requirements
✅ Draft submissions skip validation
✅ Rejects unauthenticated requests
✅ Validates required fields

### Roast Submission API (`/api/submit-roast`)
✅ Successful roast request with valid data
✅ Admin bypasses tier requirements
✅ Rejects unauthenticated requests
✅ Validates required fields
✅ Validates Moxfield URL format

### Patreon Integration (`lib/api/patreon.ts`)
✅ Tier determination by pledge amount
✅ All 6 tiers (Citizen, Knight, Emissary, Duke, Wizard, ArchMage)
✅ Boundary value testing

## Coverage Thresholds

Current thresholds set to **50%** for pragmatic ship-ready coverage:

```typescript
thresholds: {
  lines: 50,
  functions: 50,
  branches: 50,
  statements: 50,
}
```

## Writing New Tests

### Prefer Integration Tests

When testing API routes, use real test users instead of mocking:

```typescript
// ✅ Good - Real integration test
const response = await fetch('http://localhost:8888/api/endpoint', {
  headers: { Authorization: `Bearer ${testUserToken}` }
})

// ❌ Avoid - Heavy mocking
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/auth/server-auth')
```

### Test User Access

All integration tests use the same test user created by `bun run create-test-user`:

```typescript
beforeAll(async () => {
  const { data } = await supabase.auth.signInWithPassword({
    email: 'test@testing.com',
    password: 'password',
  })
  testUserToken = data.session.access_token
})
```

## Troubleshooting

### "Failed to sign in test user"
**Solution**: Run `bun run create-test-user` to create the test user

### Tests can't connect to localhost:8888
**Solution**: Ensure dev server is running with `bun run dev`

### Database queries failing
**Solution**: Check that `.env.local` has valid Supabase credentials

### Coverage threshold not met
**Solution**: Coverage is set to 50% - lower threshold if needed in `vitest.config.ts`

## CI/CD Considerations

For CI environments:
1. Seed test database with test user
2. Ensure dev server starts before tests
3. Use `bun run test` (no need for separate database)

## Philosophy

This project follows a **pragmatic testing approach**:
- Real integration tests over unit tests with heavy mocking
- Test the happy path and critical error cases
- Ship-ready code with 50% coverage over 85% coverage that doesn't test real scenarios
- Use real test users to catch actual integration issues
