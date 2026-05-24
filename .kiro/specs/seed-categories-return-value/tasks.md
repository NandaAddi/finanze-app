# Implementation Plan

## Overview

Fix `seedDefaultCategories` in `app/actions/finance.ts` to return the array of newly created categories instead of `{ success: true }`, so that `add-transaction-dialog.tsx` can populate the category dropdown for new users.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2"] },
    { "wave": 2, "tasks": ["3"] },
    { "wave": 3, "tasks": ["4"] }
  ]
}
```

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - seedDefaultCategories Returns Object Instead of Array
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — any valid `walletId` string passed to `seedDefaultCategories` on unfixed code
  - Mock the Supabase `insert` chain to return a realistic array of 3 category rows (simulating what `.select()` would return after fix)
  - Call `seedDefaultCategories(walletId)` with arbitrary `walletId` strings and assert `Array.isArray(result) === true`
  - Assert `result.length === 3` — will fail on unfixed code (`{ success: true }.length === undefined`)
  - Assert `result[0].id !== undefined` — will fail on unfixed code (`{ success: true }[0] === undefined`)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists: `seedDefaultCategories` returns `{ success: true }` not an array)
  - Document counterexamples found: e.g., `seedDefaultCategories('wallet_abc')` returns `{ success: true }`, `Array.isArray({ success: true })` → `false`, `{ success: true }.length` → `undefined`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Category Loading and Database Write Behavior Unaffected
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: when `categoryData.length > 0`, `seedDefaultCategories` is NOT called — `getCategories()` returns the existing array unchanged
  - Observe on UNFIXED code: `seedDefaultCategories` always writes exactly 3 rows (Food, Transport, Others) to the `categories` table with correct `wallet_id` and `created_by` fields
  - Observe on UNFIXED code: `getAuth()` is always called first — unauthorized requests throw before any DB operation
  - Write property-based test: for all non-empty `categoryData` arrays (any length ≥ 1), `seedDefaultCategories` is never invoked and `categories` state equals the existing `categoryData` (from Preservation Requirements in design)
  - Write property-based test: for all valid `walletId` strings, the insert payload always contains exactly 3 items with names `['Food', 'Transport', 'Others']`, correct `wallet_id`, and correct `created_by`
  - Write property-based test: calling `seedDefaultCategories` without a valid Clerk session always throws an `Unauthorized` error
  - Run all preservation tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix seedDefaultCategories return value

  - [x] 3.1 Implement the fix in `app/actions/finance.ts`
    - Add `.select()` to the end of the Supabase insert chain: `supabaseAdmin.from('categories').insert(...).select()`
    - Capture the result: change `await supabaseAdmin...` to `const { data, error } = await supabaseAdmin...`
    - Add error guard: `if (error) throw error;` — consistent with the pattern used in `createWallet` and other functions in the same file
    - Change return statement: replace `return { success: true }` with `return data`
    - No changes required in `add-transaction-dialog.tsx` — `setCategories(seeded || [])`, `seeded.length`, and `seeded[0].id` are already structurally correct
    - _Bug_Condition: isBugCondition(context) where context.categoryData = NULL OR context.categoryData.length = 0, AND context.walletData != NULL AND context.walletData.length > 0_
    - _Expected_Behavior: seedDefaultCategories(walletId) returns Array where Array.isArray(result) = true, result.length = 3, result[0].id != null — enabling setCategories(seeded) to populate the dropdown and setCategoryId(seeded[0].id) to set the default_
    - _Preservation: getCategories() for existing users is unaffected; 3 default categories (Food, Transport, Others) continue to be written to DB with correct wallet_id and created_by; getAuth() continues to validate before any DB operation; first category continues to be set as default after seeding_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - seedDefaultCategories Returns Category Array
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior (Array.isArray, length === 3, result[0].id defined)
    - When this test passes, it confirms the fixed function returns the array of newly created categories
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed — `seedDefaultCategories` now returns the array from `.select()`)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Category Loading and Database Write Behavior Unaffected
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2 against the fixed code
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions — existing-user flow, DB write shape, and auth validation are all unchanged)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite and confirm all tests pass
  - Verify Property 1 (Bug Condition) passes — `seedDefaultCategories` returns an array with 3 items
  - Verify Property 2 (Preservation) passes — existing-user flow and DB write behavior are unchanged
  - Confirm no TypeScript errors are introduced by the change
  - Ask the user if any questions arise

## Notes

- The fix is a single-function change in `app/actions/finance.ts` — no changes to `add-transaction-dialog.tsx` are needed.
- Task 1 is expected to FAIL on unfixed code — this is intentional and confirms the bug exists.
- Task 2 is expected to PASS on unfixed code — this establishes the preservation baseline.
- After implementing the fix in 3.1, both property tests should pass.
- Use a Supabase mock (e.g., `jest.mock` or `vitest.mock`) to isolate unit tests from the live database.
- For property-based tests, use a library such as `fast-check` (already common in TypeScript/Next.js projects) to generate arbitrary `walletId` strings and `categoryData` arrays.
