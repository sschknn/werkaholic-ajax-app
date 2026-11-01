import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createUserDocument,
  updateUserSubscription,
  migrateLocalData,
  getUserHistory,
  addHistoryItem,
  updateHistoryItem,
  deleteHistoryItem,
  saveListing,
  getListing,
  getUserListings,
  saveSaleTransaction,
  getUserSaleTransactions,
  updateUserOnboardingProgress,
  saveFeedback,
  createBatchJob,
  updateBatchJob,
  getBatchJob
} from '../firestoreService';

// Mock firestore functions directly
const mockDoc = vi.fn<(...args: any[]) => any>((...args: any[]) => ({
  ...args[args.length - 1],
  id: args[args.length - 1] || `doc_${Math.random().toString(36).slice(2)}`,
}));

const mockCollection = vi.fn<(...args: any[]) => any>((...args: any[]) => ({
  ...args[args.length - 1],
  id: args[args.length - 1] || `collection_${Math.random().toString(36).slice(2)}`,
}));

const mockSetDoc = vi.fn(async (docRef: any, data: any, options?: any) => {
  docRef.data = data;
  docRef.options = options;
  return undefined;
});

const mockGetDoc = vi.fn(async (docRef: any) => ({
  exists: vi.fn().mockReturnValue(true),
  data: vi.fn().mockReturnValue({ id: docRef.id, ...docRef.data }),
}));

const mockGetDocs = vi.fn(async (snapshot: any) => {
  const docs: any[] = [];
  if (snapshot.forEach) {
    snapshot.forEach((doc: any) => {
      docs.push({ id: doc.id, data: () => ({ ...doc }) });
    });
  }
  return { empty: docs.length === 0, docs, forEach: (cb: any) => docs.forEach(cb) };
});

const mockUpdateDoc = vi.fn(async (docRef: any, data: any) => {
  docRef.data = { ...docRef.data, ...data };
  return undefined;
});

const mockDeleteDoc = vi.fn(async (docRef: any) => {
  docRef.data = {};
  return undefined;
});

const mockQuery = vi.fn<(...args: any[]) => any>((...args: any[]) => ({
  ...args[args.length - 1],
  id: args[args.length - 1] || `query_${Math.random().toString(36).slice(2)}`,
}));

const mockWhere = vi.fn(() => ({}));

const mockOrderBy = vi.fn(() => ({}));

const doc = mockDoc;
const collection = mockCollection;
const setDoc = mockSetDoc;
const getDoc = mockGetDoc;
const getDocs = mockGetDocs;
const updateDoc = mockUpdateDoc;
const deleteDoc = mockDeleteDoc;
const query = mockQuery;
const where = mockWhere;
const orderBy = mockOrderBy;

const mockAnalysis = {
  item_detected: true,
  title: 'Test Produkt',
  price_estimate: '50€ - 70€',
  condition: 'Gut',
  category: 'Elektronik',
  description: 'Test Beschreibung',
  keywords: ['test', 'produkt'],
  reasoning: 'Test Reasoning',
};

describe('Firestore Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserDocument', () => {
    it('should create a user document with default subscription and onboarding data', async () => {
      const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      await createUserDocument(mockUser);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'test-user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          subscription: expect.objectContaining({
            plan: 'free',
            scansUsed: 0,
            isActive: true,
          }),
          onboarding: expect.objectContaining({
            step: 0,
            completed: false,
          }),
        })
      );
    });

    it('should merge user data with existing document', async () => {
      const mockUser = {
        uid: 'test-user-456',
        email: 'test2@example.com',
      };

      await createUserDocument(mockUser);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'test-user-456',
          email: 'test2@example.com',
          subscription: expect.objectContaining({ plan: 'free' }),
          onboarding: expect.objectContaining({ step: 0, completed: false }),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
        { merge: true }
      );
    });
  });

  describe('updateUserSubscription', () => {
    it('should update user subscription', async () => {
      await updateUserSubscription('user-123', {
        plan: 'pro',
        scansUsed: 10,
        resetDate: new Date().toISOString(),
        isActive: true,
        commissionRate: 0.05,
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          subscription: expect.objectContaining({ plan: 'pro' }),
          updatedAt: expect.any(String),
        })
      );
    });
  });

  describe('migrateLocalData', () => {
    it('should migrate local history data to Firestore when no existing data', async () => {
      localStorage.setItem('werkaholic_history', JSON.stringify([]));

      await migrateLocalData('user-123');

      expect(getDocs).toHaveBeenCalledWith(expect.anything());
    });

    it('should not migrate when localStorage is empty', async () => {
      localStorage.removeItem('werkaholic_history');

      await migrateLocalData('user-123');

      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  describe('getUserHistory', () => {
    it('should return user history ordered by date descending', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ date: '2024-01-01', analysis: mockAnalysis }) },
        { id: '2', data: () => ({ date: '2024-01-02', analysis: mockAnalysis }) },
      ];

      const getDocsMock = getDocs as any;
      getDocsMock.mockResolvedValueOnce({
        empty: false,
        docs: mockDocs,
        forEach: (cb: any) => mockDocs.forEach(cb),
      });

      const result = await getUserHistory('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-02'); // Most recent first
      expect(result[1].date).toBe('2024-01-01');
    });

    it('should return empty array when no history exists', async () => {
      const getDocsMock = getDocs as any;
      getDocsMock.mockResolvedValueOnce({
        empty: true,
        docs: [],
        forEach: () => {},
      });

      const result = await getUserHistory('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('addHistoryItem', () => {
    it('should add a history item and return its ID', async () => {
      const mockItem = {
        id: 'new-history-id',
        image: 'test-image.jpg',
        date: new Date().toISOString(),
        analysis: mockAnalysis,
      };

      const setDocMock = setDoc as any;
      const getDocMock = getDoc as any;
      setDocMock.mockResolvedValueOnce(undefined);
      getDocMock.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ id: 'new-history-id', ...mockItem }),
      });

      const result = await addHistoryItem('user-123', mockItem);

      expect(result).toBe('new-history-id');
      expect(setDocMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...mockItem,
          createdAt: expect.any(String),
          lastModified: expect.any(String),
        })
      );
    });
  });

  describe('updateHistoryItem', () => {
    it('should update a history item with lastModified timestamp', async () => {
      const updates = {
        analysis: { ...mockAnalysis, title: 'Updated Title' },
      };

      await updateHistoryItem('user-123', 'item-123', updates);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updates,
          lastModified: expect.any(String),
        })
      );
    });
  });

  describe('deleteHistoryItem', () => {
    it('should delete a history item', async () => {
      await deleteHistoryItem('user-123', 'item-123');

      expect(deleteDoc).toHaveBeenCalledWith(
        doc(collection(db! as any, 'users'), 'user-123', 'history', 'item-123')
      );
    });
  });

  describe('saveListing', () => {
    it('should save a listing with merge option', async () => {
      const mockListing = {
        id: 'listing-123',
        userId: 'user-123',
        analysisId: 'analysis-123',
        platform: 'ebay-kleinanzeigen' as const,
        platformListingId: '123456',
        status: 'active' as const,
        price: 50,
        currency: 'EUR',
        title: 'Test Item',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveListing(mockListing);

      expect(setDoc).toHaveBeenCalledWith(
        doc(collection(db! as any, 'listings'), 'listing-123'),
        expect.objectContaining({
          ...mockListing,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
        { merge: true }
      );
    });
  });

  describe('getListing', () => {
    it('should return a listing if it exists', async () => {
      const getDocMock = getDoc as any;
      getDocMock.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          id: 'listing-123',
          userId: 'user-123',
          platform: 'ebay-kleinanzeigen',
          title: 'Test Item',
          price: 50,
          currency: 'EUR',
        }),
      });

      const result = await getListing('listing-123');

      expect(result).toEqual({
        id: 'listing-123',
        userId: 'user-123',
        platform: 'ebay-kleinanzeigen',
        title: 'Test Item',
        price: 50,
        currency: 'EUR',
      });
    });

    it('should return null when listing does not exist', async () => {
      const getDocMock = getDoc as any;
      getDocMock.mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      });

      const result = await getListing('nonexistent-listing');

      expect(result).toBeNull();
    });
  });

  describe('getUserListings', () => {
    it('should return user listings sorted by createdAt descending', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ createdAt: '2024-01-01', title: 'Item A', userId: 'user-123' }) },
        { id: '2', data: () => ({ createdAt: '2024-01-02', title: 'Item B', userId: 'user-123' }) },
      ];

      const getDocsMock = getDocs as any;
      getDocsMock.mockResolvedValueOnce({
        empty: false,
        docs: mockDocs,
        forEach: (cb: any) => mockDocs.forEach(cb),
      });

      const result = await getUserListings('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Item B'); // Most recent first
      expect(result[1].title).toBe('Item A');
    });
  });

  describe('saveSaleTransaction', () => {
    it('should save a sale transaction with merge option', async () => {
      const mockTransaction = {
        id: 'tx-123',
        userId: 'user-123',
        listingId: 'listing-123',
        platform: 'ebay-kleinanzeigen' as const,
        salePrice: 50,
        currency: 'EUR',
        fees: 5,
        netAmount: 45,
        soldAt: new Date().toISOString(),
        paymentStatus: 'completed' as const,
        shippingStatus: 'shipped' as const,
      };

      await saveSaleTransaction(mockTransaction);

      expect(setDoc).toHaveBeenCalledWith(
        doc(collection(db! as any, 'saleTransactions'), 'tx-123'),
        expect.objectContaining({
          ...mockTransaction,
          createdAt: expect.any(String),
        }),
        { merge: true }
      );
    });
  });

  describe('getUserSaleTransactions', () => {
    it('should return user sale transactions sorted by soldAt descending', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ soldAt: '2024-01-01', salePrice: 50, platform: 'ebay-kleinanzeigen' }) },
        { id: '2', data: () => ({ soldAt: '2024-01-02', salePrice: 75, platform: 'ebay-kleinanzeigen' }) },
      ];

      const getDocsMock = getDocs as any;
      getDocsMock.mockResolvedValueOnce({
        empty: false,
        docs: mockDocs,
        forEach: (cb: any) => mockDocs.forEach(cb),
      });

      const result = await getUserSaleTransactions('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].salePrice).toBe(75); // Most recent first
      expect(result[1].salePrice).toBe(50);
    });

    it('should return empty array when no transactions exist', async () => {
      const getDocsMock = getDocs as any;
      getDocsMock.mockResolvedValueOnce({
        empty: true,
        docs: [],
        forEach: () => {},
      });

      const result = await getUserSaleTransactions('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('updateUserOnboardingProgress', () => {
    it('should update onboarding progress and set completedAt when completed', async () => {
      await updateUserOnboardingProgress('user-123', { step: 5, completed: true, firstScan: true });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          onboarding: expect.objectContaining({
            step: 5,
            completed: true,
            completedAt: expect.any(String),
          }),
          updatedAt: expect.any(String),
        })
      );
    });

    it('should not set completedAt when not completed', async () => {
      await updateUserOnboardingProgress('user-123', { step: 3, completed: false, firstScan: false });

      const callArgs = (updateDoc as any).mock.calls[0][1];
      expect(callArgs.onboarding.completedAt).toBeUndefined();
    });
  });

  describe('saveFeedback', () => {
    it('should save feedback with merge option', async () => {
      const mockFeedback = {
        id: 'fb-123',
        rating: 5,
        comment: 'Great service!',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0',
        url: 'https://example.com',
      };

      await saveFeedback(mockFeedback);

      expect(setDoc).toHaveBeenCalledWith(
        doc(collection(db! as any, 'feedback'), 'fb-123'),
        expect.objectContaining({
          ...mockFeedback,
          createdAt: expect.any(String),
        }),
        { merge: true }
      );
    });
  });

  describe('createBatchJob', () => {
    it('should create a batch job with pending status', async () => {
      const result = await createBatchJob('user-123', 'Test Batch', 10);

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^batch_user-123_/),
          name: 'Test Batch',
          status: 'pending',
          totalImages: 10,
          processedImages: 0,
          results: [],
        })
      );

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: expect.stringMatching(/^batch_user-123_/),
          name: 'Test Batch',
          status: 'pending',
          totalImages: 10,
          processedImages: 0,
          results: [],
        })
      );
    });
  });

  describe('updateBatchJob', () => {
    it('should update batch job status and timestamp', async () => {
      await updateBatchJob('batch-123', { status: 'completed', processedImages: 10 });

      expect(updateDoc).toHaveBeenCalledWith(
        doc(collection(db! as any, 'batchJobs'), 'batch-123'),
        expect.objectContaining({
          status: 'completed',
          processedImages: 10,
          updatedAt: expect.any(String),
          completedAt: expect.any(String),
        })
      );
    });
  });

  describe('getBatchJob', () => {
    it('should return a batch job if it exists', async () => {
      const mockBatchJob = {
        id: 'batch-123',
        name: 'Test Batch',
        status: 'completed',
        totalImages: 10,
        processedImages: 10,
        results: [],
      };

      const getDocMock = getDoc as any;
      getDocMock.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ ...mockBatchJob, createdAt: new Date().toISOString() }),
      });

      const result = await getBatchJob('batch-123');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'batch-123',
          name: 'Test Batch',
          status: 'completed',
        })
      );
    });

    it('should return null when batch job does not exist', async () => {
      const getDocMock = getDoc as any;
      getDocMock.mockResolvedValueOnce({
        exists: () => false,
        data: () => null,
      });

      const result = await getBatchJob('nonexistent-batch');

      expect(result).toBeNull();
    });
  });
});