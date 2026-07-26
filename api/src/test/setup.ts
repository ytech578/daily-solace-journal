import { vi } from 'vitest';

// Mock the Prisma client globally so no real DB connection is needed in tests.
// Individual test files can override specific methods with vi.mocked().
vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    submission: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));
