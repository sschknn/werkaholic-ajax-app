import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { HistoryItem, PlatformListing, SaleTransaction } from '../types';

export class FirestoreService {
  // Migrate localStorage data to Firestore
  static async migrateLocalData(userId: string): Promise<void> {
    try {
      const localHistory = localStorage.getItem('werkaholic_history');
      if (!localHistory) return;

      const history: HistoryItem[] = JSON.parse(localHistory);

      // Check if data already exists in Firestore
      const userHistoryRef = collection(db, 'users', userId, 'history');
      const existingDocs = await getDocs(userHistoryRef);

      if (existingDocs.empty) {
        // Migrate data
        for (const item of history) {
          await setDoc(doc(userHistoryRef, item.id), item);
        }
        console.log('Data migrated to Firestore');
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  // Get user's history from Firestore
  static async getUserHistory(userId: string): Promise<HistoryItem[]> {
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
  }

  // Add item to user's history
  static async addHistoryItem(userId: string, item: HistoryItem): Promise<void> {
    try {
      const userHistoryRef = collection(db, 'users', userId, 'history');
      await setDoc(doc(userHistoryRef, item.id), item);
    } catch (error) {
      console.error('Failed to add history item:', error);
    }
  }

  // Add ad text to existing history item
  static async addAdText(userId: string, itemId: string, adText: string, platform: string): Promise<void> {
    try {
      const itemRef = doc(db, 'users', userId, 'history', itemId);
      await updateDoc(itemRef, {
        adText,
        platform,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to add ad text:', error);
    }
  }

  // Update history item
  static async updateHistoryItem(userId: string, itemId: string, updatedItem: Partial<HistoryItem>): Promise<void> {
    try {
      const itemRef = doc(db, 'users', userId, 'history', itemId);
      await updateDoc(itemRef, updatedItem);
    } catch (error) {
      console.error('Failed to update history item:', error);
    }
  }

  // Delete history item
  static async deleteHistoryItem(userId: string, itemId: string): Promise<void> {
    try {
      const itemRef = doc(db, 'users', userId, 'history', itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  }

  // Get user subscription status
  static async getUserSubscription(userId: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.data()?.subscription || null;
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      return null;
    }
  }

  // Update user subscription
  static async updateUserSubscription(userId: string, subscription: any): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { subscription }, { merge: true });
    } catch (error) {
      console.error('Failed to update user subscription:', error);
    }
  }

  // Get user onboarding progress
  static async getUserOnboardingProgress(userId: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.data()?.onboarding || null;
    } catch (error) {
      console.error('Failed to get user onboarding progress:', error);
      return null;
    }
  }

  // Update user onboarding progress
  static async updateUserOnboardingProgress(userId: string, onboarding: any): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { onboarding }, { merge: true });
    } catch (error) {
      console.error('Failed to update user onboarding progress:', error);
    }
  }

  // Plattform-Listings

  // Listing speichern
  static async saveListing(listing: PlatformListing): Promise<void> {
    try {
      const listingRef = doc(db, 'listings', listing.id);
      await setDoc(listingRef, listing);
    } catch (error) {
      console.error('Failed to save listing:', error);
      throw error;
    }
  }

  // Listing abrufen
  static async getListing(listingId: string): Promise<PlatformListing | null> {
    try {
      const listingRef = doc(db, 'listings', listingId);
      const listingDoc = await getDoc(listingRef);
      return listingDoc.exists() ? listingDoc.data() as PlatformListing : null;
    } catch (error) {
      console.error('Failed to get listing:', error);
      return null;
    }
  }

  // Listing aktualisieren
  static async updateListing(listingId: string, updates: Partial<PlatformListing>): Promise<void> {
    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, updates);
    } catch (error) {
      console.error('Failed to update listing:', error);
      throw error;
    }
  }

  // User Listings abrufen
  static async getUserListings(userId: string, startDate?: string, endDate?: string): Promise<PlatformListing[]> {
    console.log(`[DEBUG] getUserListings started for userId: ${userId}`);
    const startTime = Date.now();
    try {
      const listingsRef = collection(db, 'listings');
      let q = query(listingsRef, where('userId', '==', userId));

      if (startDate || endDate) {
        // Für Datumsfilter würden wir eine andere Query-Struktur brauchen
        // Vereinfacht für jetzt
      }

      const querySnapshot = await getDocs(q);
      const listings: PlatformListing[] = [];
      querySnapshot.forEach((doc) => {
        listings.push(doc.data() as PlatformListing);
      });

      console.log(`[DEBUG] getUserListings fetched ${listings.length} listings`);

      // Clientseitig nach createdAt absteigend sortieren
      listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const endTime = Date.now();
      console.log(`[DEBUG] getUserListings completed in ${endTime - startTime}ms`);
      return listings;
    } catch (error) {
      console.error('Failed to get user listings:', error);
      console.log(`[DEBUG] getUserListings failed after ${Date.now() - startTime}ms`);
      return [];
    }
  }

  // Verkaufstransaktionen

  // Verkaufstransaktion speichern
  static async saveSaleTransaction(transaction: SaleTransaction): Promise<void> {
    try {
      const transactionRef = doc(db, 'saleTransactions', transaction.id);
      await setDoc(transactionRef, transaction);
    } catch (error) {
      console.error('Failed to save sale transaction:', error);
      throw error;
    }
  }

  // User Verkaufstransaktionen abrufen
  static async getUserSaleTransactions(userId: string, startDate?: string, endDate?: string): Promise<SaleTransaction[]> {
    console.log(`[DEBUG] getUserSaleTransactions started for userId: ${userId}`);
    const startTime = Date.now();
    try {
      const transactionsRef = collection(db, 'saleTransactions');
      let q = query(transactionsRef, where('userId', '==', userId));

      const querySnapshot = await getDocs(q);
      const transactions: SaleTransaction[] = [];
      querySnapshot.forEach((doc) => {
        transactions.push(doc.data() as SaleTransaction);
      });

      console.log(`[DEBUG] getUserSaleTransactions fetched ${transactions.length} transactions`);

      // Clientseitig nach soldAt absteigend sortieren
      transactions.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());

      const endTime = Date.now();
      console.log(`[DEBUG] getUserSaleTransactions completed in ${endTime - startTime}ms`);
      return transactions;
    } catch (error) {
      console.error('Failed to get user sale transactions:', error);
      console.log(`[DEBUG] getUserSaleTransactions failed after ${Date.now() - startTime}ms`);
      return [];
    }
  }
}