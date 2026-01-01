import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { HistoryItem } from '../types';

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
}