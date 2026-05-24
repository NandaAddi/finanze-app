/**
 * Bug Condition Exploration Test
 *
 * Property 1: Bug Condition — seedDefaultCategories Returns Object Instead of Array
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists: seedDefaultCategories returns { success: true }
 * instead of the array of newly created categories.
 *
 * DO NOT fix the code or the test when it fails.
 *
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Use vi.hoisted so mock variables are available inside vi.mock factories
// ---------------------------------------------------------------------------
const { mockInsert, mockSelect, mockFrom } = vi.hoisted(() => {
  const MOCK_CATEGORIES = [
    { id: 'cat_aaa111bbb', name: 'Food',      icon: 'utensils', color: '#10b981', wallet_id: '', created_by: 'user_test_123', position: 0 },
    { id: 'cat_ccc222ddd', name: 'Transport', icon: 'car',      color: '#3b82f6', wallet_id: '', created_by: 'user_test_123', position: 1 },
    { id: 'cat_eee333fff', name: 'Others',    icon: 'grid',     color: '#6b7280', wallet_id: '', created_by: 'user_test_123', position: 2 },
  ];
  // Fixed code calls .insert(...).select() — mock the chain accordingly
  const mockSelect = vi.fn().mockResolvedValue({ data: MOCK_CATEGORIES, error: null });
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
  const mockFrom   = vi.fn().mockReturnValue({ insert: mockInsert });
  return { mockInsert, mockSelect, mockFrom };
});

// ---------------------------------------------------------------------------
// Mock external dependencies BEFORE importing the module under test
// ---------------------------------------------------------------------------

// Mock Clerk auth — always returns a valid userId so auth never throws
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test_123' }),
  currentUser: vi.fn().mockResolvedValue(null),
}));

// Mock next/cache — revalidatePath is a no-op in tests
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase admin client — insert chain returns 3 realistic category rows
vi.mock('@/utils/supabase/admin', () => ({
  supabaseAdmin: { from: mockFrom },
}));

// ---------------------------------------------------------------------------
// Import the function under test AFTER mocks are set up
// ---------------------------------------------------------------------------
import { seedDefaultCategories } from './finance';

// ---------------------------------------------------------------------------
// Realistic mock categories (used for assertions)
// ---------------------------------------------------------------------------
const MOCK_CATEGORIES = [
  { id: 'cat_aaa111bbb', name: 'Food',      icon: 'utensils', color: '#10b981', wallet_id: '', created_by: 'user_test_123', position: 0 },
  { id: 'cat_ccc222ddd', name: 'Transport', icon: 'car',      color: '#3b82f6', wallet_id: '', created_by: 'user_test_123', position: 1 },
  { id: 'cat_eee333fff', name: 'Others',    icon: 'grid',     color: '#6b7280', wallet_id: '', created_by: 'user_test_123', position: 2 },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Bug Condition Exploration — seedDefaultCategories returns object instead of array', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply mock implementations after clearAllMocks
    // Fixed code calls .insert(...).select() — restore the full chain
    mockSelect.mockResolvedValue({ data: MOCK_CATEGORIES, error: null });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert });
  });

  /**
   * Property 1: Bug Condition
   *
   * For any valid walletId string, seedDefaultCategories MUST return an array.
   * On UNFIXED code this FAILS because the function returns { success: true }.
   *
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  it('Property 1 (Bug Condition): seedDefaultCategories should return an array for any walletId', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary non-empty walletId strings
        fc.string({ minLength: 1, maxLength: 64 }).filter(s => s.trim().length > 0),
        async (walletId) => {
          const result = await seedDefaultCategories(walletId);

          // Assert 1: result must be an array
          // FAILS on unfixed code: Array.isArray({ success: true }) === false
          expect(Array.isArray(result)).toBe(true);

          // Assert 2: result must have length 3
          // FAILS on unfixed code: { success: true }.length === undefined
          expect((result as any[]).length).toBe(3);

          // Assert 3: first element must have a defined id
          // FAILS on unfixed code: { success: true }[0] === undefined
          expect((result as any[])[0].id).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Concrete example: the canonical failing case documented in the bug report.
   * seedDefaultCategories('wallet_abc') returns { success: true } on unfixed code.
   */
  it('Concrete case: seedDefaultCategories("wallet_abc") should return an array', async () => {
    const result = await seedDefaultCategories('wallet_abc');

    // FAILS on unfixed code: Array.isArray({ success: true }) === false
    expect(Array.isArray(result)).toBe(true);

    // FAILS on unfixed code: { success: true }.length === undefined
    expect((result as any[]).length).toBe(3);

    // FAILS on unfixed code: { success: true }[0] === undefined
    expect((result as any[])[0].id).toBeDefined();
  });
});
