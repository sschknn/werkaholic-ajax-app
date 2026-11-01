import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  AdAnalysis, 
  HistoryItem, 
  PlatformListing, 
  SaleTransaction, 
  SubscriptionInfo, 
  Feedback, 
  BatchJob, 
  BatchResult, 
  BatchQueueItem
} from '../types/v1/types';
import { ViewState, ViewType, PlatformType, SharePlatform } from '../../utils/constants';

// ====================
// Auth & User Management
// ====================

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  subscription: SubscriptionInfo;
  onboarding: {
    step: number;
    completed: boolean;
    firstScan: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const createUserDocument = async (user: any): Promise<void> => {
  try {
    const userRef = doc(collection(db, 'users'), user.uid);
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      subscription: {
        plan: 'free',
        scansUsed: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        commissionRate: 0.02,
      },
      onboarding: {
        step: 0,
        completed: false,
        firstScan: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, userData, { merge: true });
    console.log('User document created:', user.uid);
  } catch (error) {
    console.error('Failed to create user document:', error);
    throw error;
  }
};

export const updateUserSubscription = async (userId: string, subscription: SubscriptionInfo): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscription,
      updatedAt: new Date().toISOString(),
    });
    console.log('Subscription updated for user:', userId);
  } catch (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
};

// ====================
// History Management
// ====================

export const migrateLocalData = async (userId: string): Promise<void> => {
  try {
    const localHistory = localStorage.getItem('werkaholic_history');
    if (!localHistory) return;

    const history: HistoryItem[] = JSON.parse(localHistory);
    const userHistoryRef = collection(db, 'users', userId, 'history');

    // Check if data already exists in Firestore
    const existingDocs = await getDocs(userHistoryRef);
    if (existingDocs.empty) {
      // Migrate data
      for (const item of history) {
        await setDoc(doc(userHistoryRef, item.id), {
          ...item,
          createdAt: item.createdAt || new Date().toISOString(),
          lastModified: new Date().toISOString(),
        });
      }
      console.log('Data migrated to Firestore:', history.length, 'items');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const getUserHistory = async (userId: string): Promise<HistoryItem[]> => {
  try {
    const userHistoryRef = collection(db, 'users', userId, 'history');
    const q = query(userHistoryRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const history: HistoryItem[] = [];
    querySnapshot.forEach((doc) => {
      history.push(doc.data() as HistoryItem);
    });

    return history;
  } catch (error) {
    console.error('Failed to get user history:', error);
    return [];
  }
};

export const addHistoryItem = async (userId: string, item: HistoryItem): Promise<string> => {
  try {
    const userHistoryRef = collection(db, 'users', userId, 'history');
    const newDoc = doc(userHistoryRef);
    await setDoc(newDoc, {
      ...item,
      id: newDoc.id,
      createdAt: item.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
    });
    return newDoc.id;
  } catch (error) {
    console.error('Failed to add history item:', error);
    throw error;
  }
};

export const updateHistoryItem = async (userId: string, itemId: string, updatedItem: Partial<HistoryItem>): Promise<void> => {
  try {
    const itemRef = doc(db, 'users', userId, 'history', itemId);
    await updateDoc(itemRef, {
      ...updatedItem,
      lastModified: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update history item:', error);
    throw error;
  }
};

export const deleteHistoryItem = async (userId: string, itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'history', itemId));
  } catch (error) {
    console.error('Failed to delete history item:', error);
    throw error;
  }
};

// ====================
// Listing Management
// ====================

export const saveListing = async (listing: PlatformListing): Promise<void> => {
  try {
    const listingRef = doc(collection(db, 'listings'), listing.id);
    await setDoc(listingRef, {
      ...listing,
      createdAt: listing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save listing:', error);
    throw error;
  }
};

export const getListing = async (listingId: string): Promise<PlatformListing | null> => {
  try {
    const listingRef = doc(db, 'listings', listingId);
    const listingDoc = await getDoc(listingRef);
    return listingDoc.exists() ? listingDoc.data() as PlatformListing : null;
  } catch (error) {
    console.error('Failed to get listing:', error);
    return null;
  }
};

export const getUserListings = async (userId: string, startDate?: string, endDate?: string): Promise<PlatformListing[]> => {
  try {
    const listingsRef = collection(db, 'listings');
    let q = query(listingsRef, where('userId', '==', userId));

    // Date filtering would need a different query structure
    // For now, we fetch all and filter client-side
    const querySnapshot = await getDocs(q);
    const listings: PlatformListing[] = [];
    querySnapshot.forEach((doc) => {
      listings.push(doc.data() as PlatformListing);
    });

    // Clientseitig nach createdAt absteigend sortieren
    listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return listings;
  } catch (error) {
    console.error('Failed to get user listings:', error);
    return [];
  }
};

// ====================
// Sale Transaction Management
// ====================

export const saveSaleTransaction = async (transaction: SaleTransaction): Promise<void> => {
  try {
    const transactionRef = doc(collection(db, 'saleTransactions'), transaction.id);
    await setDoc(transactionRef, {
      ...transaction,
      createdAt: transaction.createdAt || new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save sale transaction:', error);
    throw error;
  }
};

export const getUserSaleTransactions = async (userId: string, startDate?: string, endDate?: string): Promise<SaleTransaction[]> => {
  try {
    const transactionsRef = collection(db, 'saleTransactions');
    let q = query(transactionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const transactions: SaleTransaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push(doc.data() as SaleTransaction);
    });

    // Clientseitig nach soldAt absteigend sortieren
    transactions.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());
    return transactions;
  } catch (error) {
    console.error('Failed to get user sale transactions:', error);
    return [];
  }
};

// ====================
// Onboarding Management
// ====================

export const updateUserOnboardingProgress = async (userId: string, onboarding: { step: number; completed: boolean; firstScan: boolean }): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      onboarding: {
        ...onboarding,
        completedAt: onboarding.completed ? new Date().toISOString() : undefined,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update onboarding progress:', error);
    throw error;
  }
};

// ====================
// Feedback Management
// ====================

export const saveFeedback = async (feedback: Feedback): Promise<void> => {
  try {
    const feedbackRef = doc(collection(db, 'feedback'), feedback.id);
    await setDoc(feedbackRef, {
      ...feedback,
      createdAt: feedback.createdAt || new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    throw error;
  }
};

// ====================
// Batch Job Management
// ====================

export const createBatchJob = async (userId: string, name: string, totalImages: number): Promise<BatchJob> => {
  try {
    const batchJob: BatchJob = {
      id: `batch_${userId}_${Date.now()}`,
      name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: undefined,
      totalImages,
      processedImages: 0,
      results: [],
    };

    const batchJobRef = doc(collection(db, 'batchJobs'), batchJob.id);
    await setDoc(batchJobRef, batchJob);
    return batchJob;
  } catch (error) {
    console.error('Failed to create batch job:', error);
    throw error;
  }
};

export const updateBatchJob = async (batchId: string, updates: Partial<BatchJob>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'batchJobs', batchId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update batch job:', error);
    throw error;
  }
};

export const getBatchJob = async (batchId: string): Promise<BatchJob | null> => {
  try {
    const batchRef = doc(db, 'batchJobs', batchId);
    const batchDoc = await getDoc(batchRef);
    return batchDoc.exists() ? batchDoc.data() as BatchJob : null;
  } catch (error) {
    console.error('Failed to get batch job:', error);
    return null;
  }
};