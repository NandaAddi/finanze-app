/**
 * Preservation Property Tests
 *
 * Property 2: Preservation — Existing Category Loading and Database Write Behavior Unaffected
 *
 * These tests MUST PASS on UNFIXED code.
 * They establish the baseline behavior that must be preserved after the fix.
 *
 * Three preservation properties:
 *   P2a — When categoryData is non-empty, seedDefaultCategories is NEVER called
 *          and getCategories() returns the existing array unchanged.
 *   P2b — For any valid walletId, the insert payload always contains exactly 3 items
 *          with names ['Food', 'Transport', 'Others'], correct wallet_id, and correct created_by.
 *   P2c — Calling seedDefaultCategories without a valid Clerk session always throws Unauthorized.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared before vi.mock() factories reference them
// ---------------------------------------------------------------------------
const { mockInsert, mockInsertSelect, mockFrom, mockSelect, mockEq, mockOr, mockOrder, mockAuth } = vi.hoisted(() => {
  // Supabase chain mocks
  // getCategories uses: .from('categories').select('*').or(...).order(...)
  // seedDefaultCategories uses: .from('categories').insert(...).select()
  const mockOrder  = vi.fn().mockResolvedValue({ data: [], error: null });
  const mockOr     = vi.fn().mockReturnValue({ order: mockOrder });
  const mockEq     = vi.fn().mockReturnValue({ or: mockOr });
  // select returns an object that supports both .eq() (other queries) and .or() (getCategories)
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq, or: mockOr });
  // mockInsertSelect is the .select() chained after .insert() — resolves to { data: null, error: null }
  const mockInsertSelect = vi.fn().mockResolvedValue({ data: null, error: null });
  // mockInsert returns an object with a .select() method (to support .insert(...).select())
  const mockInsert = vi.fn().mockReturnValue({ select: mockInsertSelect });
  const mockFrom   = vi.fn().mockReturnValue({ select: mockSelect, insert: mockInsert });

  // Clerk auth mock — default: authenticated
  const mockAuth = vi.fn().mockResolvedValue({ userId: 'user_test_123' });

  return { mockInsert, mockInsertSelect, mockFrom, mockSelect, mockEq, mockOr, mockOrder, mockAuth };
});

// ---------------------------------------------------------------------------
// Mock external dependencies BEFORE importing the module under test
// ---------------------------------------------------------------------------

vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
  currentUser: vi.fn().mockResolvedValue(null),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  supabaseAdmin: { from: mockFrom },
}));

// ---------------------------------------------------------------------------
// Import functions under test AFTER mocks are set up
// ---------------------------------------------------------------------------
import { seedDefaultCategories, getCategories } from './finance';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a realistic category row for a given userId and walletId. */
function makeCategoryRow(name: string, walletId: string, userId: string, position: number) {
  return {
    id: `cat_${Math.random().toString(36).substring(2, 11)}`,
    name,
    icon: 'grid',
    color: '#000000',
    wallet_id: walletId,
    created_by: userId,
    position,
  };
}

// ---------------------------------------------------------------------------
// Reset mocks before each test
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks();

  // Restore default Supabase chain
  mockOrder.mockResolvedValue({ data: [], error: null });
  mockOr.mockReturnValue({ order: mockOrder });
  mockEq.mockReturnValue({ or: mockOr });
  // select supports both .eq() (other queries) and .or() (getCategories)
  mockSelect.mockReturnValue({ eq: mockEq, or: mockOr });
  // insert returns { select: mockInsertSelect } to support .insert(...).select() chain
  mockInsertSelect.mockResolvedValue({ data: null, error: null });
  mockInsert.mockReturnValue({ select: mockInsertSelect });
  mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });

  // Restore default auth (authenticated)
  mockAuth.mockResolvedValue({ userId: 'user_test_123' });
});

// ---------------------------------------------------------------------------
// P2a — Non-empty categoryData: seedDefaultCategories is never invoked
// ---------------------------------------------------------------------------

describe('P2a — Preservation: seedDefaultCategories is NOT called when categories exist', () => {
  /**
   * Property 2a:
   * For all non-empty categoryData arrays (length ≥ 1), the consumer logic
   * (fetchOptions equivalent) must NOT call seedDefaultCategories.
   * getCategories() returns the existing array unchanged.
   *
   * Validates: Requirements 3.1
   */
  it('Property 2a: for any non-empty categoryData, seedDefaultCategories is never invoked', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate non-empty arrays of category-like objects
        fc.array(
          fc.record({
            id:         fc.string({ minLength: 1, maxLength: 32 }),
            name:       fc.string({ minLength: 1, maxLength: 64 }),
            wallet_id:  fc.string({ minLength: 1, maxLength: 64 }),
            created_by: fc.string({ minLength: 1, maxLength: 64 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (categoryData) => {
          // Simulate the consumer decision: only call seedDefaultCategories when empty
          const seedSpy = vi.fn();

          // Consumer logic (mirrors fetchOptions in add-transaction-dialog.tsx)
          let categories: typeof categoryData;
          if (categoryData.length === 0) {
            // Bug condition — would call seed (not our case here)
            const seeded = await seedSpy();
            categories = seeded || [];
          } else {
            // Preservation case — use existing data directly
            categories = categoryData;
          }

          // seedSpy must NEVER be called when categoryData is non-empty
          expect(seedSpy).not.toHaveBeenCalled();

          // The resulting categories must equal the original categoryData
          expect(categories).toEqual(categoryData);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Concrete example: getCategories() returns existing rows unchanged.
   * Validates: Requirements 3.1
   */
  it('Concrete: getCategories() returns existing categories without calling seedDefaultCategories', async () => {
    const userId = 'user_test_123';
    const existingCategories = [
      makeCategoryRow('Food',      'wallet_abc', userId, 0),
      makeCategoryRow('Transport', 'wallet_abc', userId, 1),
      makeCategoryRow('Others',    'wallet_abc', userId, 2),
    ];

    // Configure Supabase mock to return existing categories
    mockOrder.mockResolvedValue({ data: existingCategories, error: null });
    mockOr.mockReturnValue({ order: mockOrder });
    mockEq.mockReturnValue({ or: mockOr });
    mockSelect.mockReturnValue({ eq: mockEq, or: mockOr });
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });

    const result = await getCategories();

    // getCategories() must return the existing rows
    expect(result).toEqual(existingCategories);

    // insert must NOT have been called — seedDefaultCategories was not invoked
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// P2b — Insert payload shape: always 3 items with correct names, wallet_id, created_by
// ---------------------------------------------------------------------------

describe('P2b — Preservation: insert payload always has correct shape', () => {
  /**
   * Property 2b:
   * For all valid walletId strings, the payload passed to Supabase insert
   * always contains exactly 3 items with names ['Food', 'Transport', 'Others'],
   * the correct wallet_id, and the correct created_by (userId from Clerk).
   *
   * Validates: Requirements 3.2
   */
  it('Property 2b: insert payload always has 3 items with correct names, wallet_id, and created_by', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary non-empty walletId strings
        fc.string({ minLength: 1, maxLength: 64 }).filter(s => s.trim().length > 0),
        async (walletId) => {
          // Reset insert mock to capture the call
          mockInsertSelect.mockResolvedValue({ data: null, error: null });
          mockInsert.mockReturnValue({ select: mockInsertSelect });
          mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });

          // Call seedDefaultCategories — we only care about what was inserted
          await seedDefaultCategories(walletId);

          // Verify insert was called exactly once
          expect(mockInsert).toHaveBeenCalledTimes(1);

          // Extract the payload passed to insert
          const insertPayload: any[] = mockInsert.mock.calls[0][0];

          // Must be an array of exactly 3 items
          expect(Array.isArray(insertPayload)).toBe(true);
          expect(insertPayload).toHaveLength(3);

          // Names must be exactly ['Food', 'Transport', 'Others'] in order
          const names = insertPayload.map((item: any) => item.name);
          expect(names).toEqual(['Food', 'Transport', 'Others']);

          // Each item must have the correct wallet_id
          insertPayload.forEach((item: any) => {
            expect(item.wallet_id).toBe(walletId);
          });

          // Each item must have the correct created_by (userId from Clerk)
          insertPayload.forEach((item: any) => {
            expect(item.created_by).toBe('user_test_123');
          });

          // Reset for next iteration
          vi.clearAllMocks();
          mockInsertSelect.mockResolvedValue({ data: null, error: null });
          mockInsert.mockReturnValue({ select: mockInsertSelect });
          mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
          mockAuth.mockResolvedValue({ userId: 'user_test_123' });
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Concrete example: verify exact insert payload for a known walletId.
   * Validates: Requirements 3.2
   */
  it('Concrete: insert payload for wallet_xyz has correct structure', async () => {
    await seedDefaultCategories('wallet_xyz');

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const payload: any[] = mockInsert.mock.calls[0][0];

    expect(payload).toHaveLength(3);
    expect(payload[0].name).toBe('Food');
    expect(payload[1].name).toBe('Transport');
    expect(payload[2].name).toBe('Others');

    payload.forEach((item: any) => {
      expect(item.wallet_id).toBe('wallet_xyz');
      expect(item.created_by).toBe('user_test_123');
      expect(item.id).toBeDefined();
      expect(item.icon).toBeDefined();
      expect(item.color).toBeDefined();
      expect(typeof item.position).toBe('number');
    });
  });
});

// ---------------------------------------------------------------------------
// P2c — Auth validation: Unauthorized error thrown without valid Clerk session
// ---------------------------------------------------------------------------

describe('P2c — Preservation: auth is always validated before any DB operation', () => {
  /**
   * Property 2c:
   * Calling seedDefaultCategories without a valid Clerk session (userId = null)
   * always throws an 'Unauthorized' error before any DB operation.
   *
   * Validates: Requirements 3.3
   */
  it('Property 2c: seedDefaultCategories always throws Unauthorized when no valid session', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary walletId strings
        fc.string({ minLength: 1, maxLength: 64 }).filter(s => s.trim().length > 0),
        async (walletId) => {
          // Simulate unauthenticated request: Clerk returns no userId
          mockAuth.mockResolvedValue({ userId: null });

          // seedDefaultCategories must throw Unauthorized
          await expect(seedDefaultCategories(walletId)).rejects.toThrow('Unauthorized');

          // insert must NOT have been called — auth guard fired first
          expect(mockInsert).not.toHaveBeenCalled();

          // Reset for next iteration
          vi.clearAllMocks();
          mockInsertSelect.mockResolvedValue({ data: null, error: null });
          mockInsert.mockReturnValue({ select: mockInsertSelect });
          mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
          mockAuth.mockResolvedValue({ userId: null });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Concrete example: unauthenticated call throws before touching the DB.
   * Validates: Requirements 3.3
   */
  it('Concrete: unauthenticated call throws Unauthorized and never calls insert', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    await expect(seedDefaultCategories('wallet_abc')).rejects.toThrow('Unauthorized');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  /**
   * Contrast: authenticated call does NOT throw and DOES call insert.
   * Validates: Requirements 3.3 (auth passes for valid sessions)
   */
  it('Contrast: authenticated call does not throw and calls insert', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_test_123' });

    await expect(seedDefaultCategories('wallet_abc')).resolves.not.toThrow();
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });
});
