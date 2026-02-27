# LaserZone Hub — Migration Plan: Mock → Production

## Overview
Migrate from a 100% client-side prototype (Zustand + localStorage + mock data) to a production platform with PostgreSQL (Railway), Prisma ORM, NextAuth.js, and Next.js API routes.

---

## PHASE 1: Database Foundation (Prisma + Schema + Seed)

### Task 1.1: Install Prisma & Configure
- `npm install prisma @prisma/client`
- `npx prisma init` → creates `prisma/schema.prisma`
- Set `DATABASE_URL` in `.env` (already done)
- Configure `prisma/schema.prisma` with `provider = "postgresql"`

### Task 1.2: Define Full Database Schema
All models based on existing TypeScript types in `src/lib/*/types.ts`:

```
User (id, email, name, password, role, avatar, shiftType, isNew, startDate, createdAt, updatedAt)
Customer (id, name, email, phone, notes, createdAt, updatedAt)
Tag (id, name, color, createdAt)
CustomerTag (customerId, tagId) — many-to-many
Reservation (id, customerId, date, startTime, endTime, players, occasion, status, notes, createdAt, updatedAt)
ChecklistTemplate (id, name, description, shiftType, timeWindowStart, timeWindowEnd, lateGraceMinutes, isActive, createdAt, updatedAt)
ChecklistItem (id, templateId, label, description, isRequired, order)
ChecklistInstance (id, templateId, assignedToId, date, status, startedAt, completedAt, createdAt)
ChecklistCompletion (id, instanceId, itemId, checkedById, checkedAt, isLate, notes)
AuditLog (id, userId, userName, action, entityType, entityId, details, wasWithinTimeWindow, createdAt) — append-only
Warning (id, employeeId, issuedById, category, level, description, details, status, managerSignature, employeeSignature, acknowledgmentComment, witnessName, clearedById, clearedReason, clearedAt, issuedAt, acknowledgedAt, createdAt, updatedAt)
OnboardingProgress (id, employeeId, currentStep, ndaSigned, ndaPdfUrl, documentsCompleted, videoProgress, videoCompleted, quizAttempts, quizPassed, quizScore, handoffCompleted, managerSignature, employeeSignature, managerId, completedAt, createdAt, updatedAt)
SocialPost (id, caption, platforms, status, scheduledAt, publishedAt, mediaUrls, createdById, createdAt, updatedAt)
SocialTemplate (id, name, caption, category, placeholders, createdAt)
HashtagSet (id, name, hashtags, createdAt)
ContentLibraryItem (id, url, type, tags, name, createdAt)
```

### Task 1.3: Run Migration
- `npx prisma migrate dev --name init`
- Verify tables created in Railway PostgreSQL

### Task 1.4: Create Seed Script
- `prisma/seed.ts` — convert existing mock data to seed
- Include 5 users with bcrypt-hashed passwords
- Include all mock customers, reservations, checklists, warnings, onboarding data
- `npx prisma db seed`

---

## PHASE 2: Authentication (NextAuth.js v5)

### Task 2.1: Install & Configure NextAuth
- `npm install next-auth@beta @auth/prisma-adapter bcryptjs`
- `npm install -D @types/bcryptjs`
- Create `src/lib/auth/auth-config.ts` with Credentials provider
- Create `src/app/api/auth/[...nextauth]/route.ts`
- Configure Prisma adapter for session management

### Task 2.2: Update Auth Store & Hooks
- Keep `useAuth()` hook API but make it fetch from NextAuth session
- Replace `authenticateMockUser()` with real credential validation
- Update `login-form.tsx` to POST to NextAuth
- Update middleware.ts for server-side route protection

### Task 2.3: Update AuthGuard & Protected Routes
- AuthGuard reads NextAuth session instead of localStorage
- Middleware protects dashboard routes server-side
- Role-based access (manager vs angajat) via session

---

## PHASE 3: API Routes (one per module)

### Task 3.1: Calendar API
- `src/app/api/calendar/customers/route.ts` — GET (list+search), POST (create)
- `src/app/api/calendar/customers/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/calendar/customers/[id]/tags/route.ts` — POST, DELETE
- `src/app/api/calendar/reservations/route.ts` — GET (by date), POST (with conflict check)
- `src/app/api/calendar/reservations/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/calendar/capacity/route.ts` — GET capacity for date/slot
- `src/app/api/calendar/tags/route.ts` — GET, POST, DELETE

### Task 3.2: Checklists API
- `src/app/api/checklists/templates/route.ts` — GET, POST
- `src/app/api/checklists/templates/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/checklists/instances/route.ts` — GET (by date/user), POST
- `src/app/api/checklists/instances/[id]/route.ts` — GET, PUT
- `src/app/api/checklists/instances/[id]/items/[itemId]/route.ts` — PUT (check/uncheck)
- `src/app/api/checklists/audit/route.ts` — GET (with filters), POST (append only)

### Task 3.3: Warnings API
- `src/app/api/warnings/route.ts` — GET (all/by employee), POST
- `src/app/api/warnings/[id]/route.ts` — GET, PUT
- `src/app/api/warnings/[id]/acknowledge/route.ts` — POST
- `src/app/api/warnings/[id]/refuse/route.ts` — POST
- `src/app/api/warnings/[id]/clear/route.ts` — POST
- `src/app/api/employees/route.ts` — GET (list)
- `src/app/api/employees/[id]/route.ts` — GET

### Task 3.4: Onboarding API
- `src/app/api/onboarding/route.ts` — GET (all incomplete)
- `src/app/api/onboarding/[employeeId]/route.ts` — GET, POST (initialize), PUT (update step)
- `src/app/api/onboarding/[employeeId]/nda/route.ts` — POST (sign)
- `src/app/api/onboarding/[employeeId]/quiz/route.ts` — POST (submit attempt)
- `src/app/api/onboarding/[employeeId]/handoff/route.ts` — POST (manager/employee confirm)

### Task 3.5: Social API
- `src/app/api/social/posts/route.ts` — GET, POST
- `src/app/api/social/posts/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/social/posts/[id]/schedule/route.ts` — POST
- `src/app/api/social/posts/[id]/publish/route.ts` — POST
- `src/app/api/social/templates/route.ts` — GET, POST
- `src/app/api/social/templates/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/social/hashtags/route.ts` — GET, POST
- `src/app/api/social/hashtags/[id]/route.ts` — PUT, DELETE
- `src/app/api/social/library/route.ts` — GET, POST
- `src/app/api/social/library/[id]/route.ts` — PUT, DELETE

### Task 3.6: Dashboard API
- `src/app/api/dashboard/stats/route.ts` — GET (aggregated stats from DB)
- `src/app/api/dashboard/tasks/route.ts` — GET (today's tasks from various modules)
- `src/app/api/dashboard/activity/route.ts` — GET (recent activity from audit log)

---

## PHASE 4: Frontend Migration (Stores → API fetch)

### Task 4.1: Create API client utilities
- `src/lib/api-client.ts` — fetch wrapper with auth headers, error handling
- Consider adding SWR or React Query for caching/revalidation

### Task 4.2: Migrate each store
For each Zustand store, replace localStorage init with API calls:
- Keep Zustand for UI state (selected items, filters, modals)
- Data CRUD → API calls with SWR/React Query
- Remove mock-data imports
- Remove localStorage persistence for data (keep for UI preferences only)

### Task 4.3: Delete mock data files
- Remove all `mock-data.ts` files
- Remove `src/lib/mock-data/` directory
- Remove `src/lib/auth/mock-users.ts`
- Remove `NEXT_PUBLIC_USE_MOCK` env var
- Clean up test credential display in login form

---

## Execution Order
1. Phase 1 (DB) → must be first, everything depends on it
2. Phase 2 (Auth) → needed before API routes (auth middleware)
3. Phase 3 (APIs) → can be parallelized per module
4. Phase 4 (Frontend) → migrate module by module after its API is ready
