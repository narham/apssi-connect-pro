

# Player Module Review and Refinement

## Problems Found

### AdminPlayers.tsx
1. **No player detail view** -- "View Detail" just shows a toast instead of opening a real detail panel
2. **No status filter** -- can only search by name/NIK, no way to filter by VERIFIED / PENDING / REJECTED
3. **No pagination** -- loads all players at once, will break at scale
4. **Approve/Reject skip audit log** -- calls raw `supabase.update()` instead of using `playerService.updateVerificationStatus()`, so no verification_logs are created
5. **Action menu never closes** -- clicking outside doesn't dismiss it
6. **"Register Player" button is non-functional**
7. **Unused imports** -- `Filter`, `Edit`, `UserX`, `Trash2`, `formatDistanceToNow` are imported but never used
8. **Debounce uses global `window` hack** instead of a proper ref/timeout pattern

### AdminVerification.tsx
9. **Entirely hardcoded mock data** (745 lines) -- not connected to the database at all; stats, queue, and actions all operate on local state

### playerService.ts
10. **Exists but unused** -- AdminPlayers duplicates its logic with raw Supabase calls

## Plan

### 1. Refactor AdminPlayers.tsx
- **Add status filter tabs** (All / Pending / Verified / Rejected) using the existing status values
- **Add pagination** (page-based, 20 per page) to `usePlayers` hook and the table footer
- **Wire approve/reject through `playerService`** so verification_logs are created automatically
- **Build a Player Detail slide-out panel** (Dialog) showing full player info, club, scores, and verification history when "View Detail" is clicked
- **Fix action menu** -- add a click-outside handler to dismiss
- **Clean up unused imports**
- **Replace window-based debounce** with a `useRef` timeout pattern
- **Remove non-functional "Register Player" button** (registration happens via the `/register` flow)

### 2. Connect AdminVerification.tsx to live data
- Replace the 186-line `initialVerificationRequests` mock array with a query from the `players` table filtered to `verification_status = 'MANUAL REVIEW'`
- Replace hardcoded stats with live counts from the database
- Wire approve/reject/reupload actions to `playerService.updateVerificationStatus()` so changes persist and audit logs are created
- Keep the existing UI layout (document viewer, face match ring, audit trail) but feed it real data from `verification_logs`

### 3. Enhance `usePlayers` hook in useAdminData.ts
- Add `statusFilter` and `page`/`limit` parameters
- Return `{ data, count, isLoading }` to support pagination footer
- Add a new `usePlayerDetail(id)` hook that fetches a single player with club, team, and verification_logs

### 4. Add `useVerificationPlayers` hook
- New query hook specifically for the verification page: fetches players with `MANUAL REVIEW` status plus their verification_logs and club names

## Technical Details

### Updated usePlayers hook signature
```typescript
export const usePlayers = (opts?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => { ... }
```

### New usePlayerDetail hook
```typescript
export const usePlayerDetail = (playerId: string | null) =>
  useQuery({
    queryKey: ['admin', 'player-detail', playerId],
    queryFn: () => playerService.getPlayerById(playerId!),
    enabled: !!playerId,
  });
```

### Player Detail Dialog
A modal/dialog showing:
- Player photo + name + club
- NIK, birth date, birth place, parent name, KK number
- Verification status + consistency/dukcapil/face match scores
- Verification history timeline from `verification_logs`

### AdminVerification live data flow
- Query: `players` WHERE `verification_status = 'MANUAL REVIEW'`, joined with `clubs(name)` and `verification_logs(*)`
- Stats: count queries for pending, today's approved, today's rejected, and high-risk (consistency_score < 40)
- Actions call `playerService.updateVerificationStatus()` which handles both the player update and the audit log insert

## Files to modify
- **Edit**: `src/hooks/useAdminData.ts` -- add pagination, status filter, usePlayerDetail, useVerificationPlayers
- **Edit**: `src/pages/admin/AdminPlayers.tsx` -- full refactor with filters, pagination, detail dialog, proper service usage
- **Edit**: `src/pages/admin/AdminVerification.tsx` -- replace mock data with live queries
- **Edit**: `src/services/playerService.ts` -- minor cleanup (no breaking changes)

