# Backend Sync - Simplified Auto-Scheduling

## ✅ Current Architecture (Auto-Only)

The backend has been **simplified** to focus on automatic scheduling only:

### Backend Changes:
1. **No manual assignment tracking** in orchestrator
2. **Automatic deduplication** - keeps first assignment per (shift, employee) pair
3. **Simple schedule generation** - no manual vs auto logic

### Frontend Changes:
1. ✅ **Deduplication before save** - prevents creating duplicates
2. ✅ **Cleanup before Auto Shift** - removes old manual assignments from Firestore
3. ✅ **API client** - has cleanup endpoint ready

---

## 🔧 Fix for "Overlapping Assignments" Error

**Error:** `Employee 1006 has overlapping assignments on 2025-11-10: 2025-11-10 10:00:00 - 2025-11-10 10:30:00 overlaps 2025-11-10 07:00:00 - 2025-11-10 15:00:00`

**Root Cause:** Old duplicate manual assignments still in Firestore from before backend simplification.

**Solution:** Frontend runs cleanup before Auto Shift to remove old duplicates.

---

## Backend Cleanup Endpoint (REQUIRED)

The backend file `main.py` has an incomplete cleanup endpoint at line ~219. 

**👉 See `backend-complete-cleanup.md` for the complete implementation.**

This endpoint:
- Removes old manual assignment duplicates from Firestore
- Groups by `(shiftId, employeeId, role)` 
- Keeps the assignment with widest time range
- Deletes all others in that group

---

## How It Works (Simplified):

### 1. Frontend (Before Auto Shift):
- Calls `api.cleanupDuplicateAssignments(weekId)` to remove old manual assignments
- Logs cleanup result (e.g., "Removed 45 duplicate assignments")

### 2. Backend (Cleanup):
- Finds all manual assignments with `isManual: true`
- Groups by `(shift, employee, role)`
- Keeps widest time range, deletes duplicates

### 3. Backend (Auto Shift):
- Orchestrator generates assignments for all roles
- **Automatic deduplication** - ensures each employee assigned to each shift only once
- No more overlapping assignment errors!

---

## Files Modified:

- ✅ `helpers/schedulerIO.ts` - Deduplication logic (preventive)
- ✅ `screens/SchedulerScreen.web.tsx` - Cleanup before Auto Shift
- ✅ `api/client.ts` - Cleanup endpoint
- 🔧 `server/main.py` - **Needs cleanup endpoint completed** (see `backend-complete-cleanup.md`)

---

## Testing:

1. **Complete the cleanup endpoint** in `main.py` using `backend-complete-cleanup.md`

2. **Restart backend server**

3. **Run cleanup manually** (optional, to clean existing data):
   ```
   POST http://localhost:5057/assignments/cleanup/2025-W45
   ```

4. **Try Auto Shift:**
   - Should succeed without overlap errors
   - Check console: "Removed X duplicate assignments"
   - Backend logs: "[CLEANUP] Deleted duplicate: ..."

5. **Verify Firestore:**
   - Each employee should have only ONE assignment per shift
   - Old manual duplicates should be removed

