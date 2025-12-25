# Student Dashboard - Implementation Plan

## Current Features (Implemented)
- Student Gallery modal with tabs (Screenshot, Blocks, Visualization)
- Manual screenshot send via airplane icon
- Auto-save visualizations (histograms, circuit diagrams) to Supabase
- Real-time updates via Supabase subscription
- Delete all functionality for admins

## Next Feature: Auto Screenshot on Green Flag

### Goal
When a student clicks the green flag and the program finishes running, automatically capture and save:
- Last frame of the stage (screenshot)
- Current block diagram

### User Decisions
- **Storage Policy**: Save all (like visualizations)
- **Rate Limiting**: 10-second cooldown between captures

### Files to Modify

1. **New: `/src/lib/save-screenshot.js`**
   - Extract screenshot logic from controls.jsx into reusable function
   - `saveScreenshotToSupabase(vm, userId, username)`

2. **Modify: `/src/lib/vm-listener-hoc.jsx`**
   - Add `PROJECT_RUN_STOP` event handler
   - Implement 10-second cooldown logic
   - Only auto-send for authenticated users

3. **Optional: `/src/containers/controls.jsx`**
   - Refactor to use new save-screenshot utility

### Event Flow
1. Student clicks green flag -> `vm.greenFlag()`
2. Program starts -> `PROJECT_RUN_START`
3. All threads finish -> `PROJECT_RUN_STOP`
4. Handler triggers:
   - Check 10s cooldown
   - Check authentication
   - Capture screenshot + blocks after 100ms delay

### Expected Results
- Student's program execution automatically shows in gallery
- Airplane button remains for manual sends
- No duplicate saves within 10 seconds
