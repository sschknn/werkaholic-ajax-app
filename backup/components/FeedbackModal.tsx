import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { Button } from './ui';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Feedback } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      addNotification({
        type: 'warning',
        title: 'Bewertung erforderlich',
        message: 'Bitte geben Sie eine Sterne-Bewertung ab.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedback: Feedback = {
        id: Date.now().toString(),
        rating,
        comment,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: user?.uid
      };

      // Speichere lokal in localStorage
      const existingFeedback = localStorage.getItem('werkaholic_feedback');
      const feedbackList: Feedback[] = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackList.push(feedback);
      localStorage.setItem('werkaholic_feedback', JSON.stringify(feedbackList));

      // Versuche, an Firebase zu senden (falls Benutzer eingeloggt)
      if (user) {
        try {
          await addDoc(collection(db, 'feedback'), feedback);
          console.log('Feedback sent to Firebase');
        } catch (firebaseError) {
          console.error('Failed to send to Firebase:', firebaseError);
          // Lokale Speicherung bleibt erhalten
        }
      }

      console.log('Feedback submitted:', feedback);

      addNotification({
        type: 'success',
        title: 'Feedback gesendet!',
        message: 'Vielen Dank für Ihr Feedback. Wir schätzen Ihre Meinung.'
      });

      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Fehler',
        message: 'Feedback konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feedback geben</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Helfen Sie uns, besser zu werden</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Wie zufrieden sind Sie mit Werkaholic AI?
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-slate-300 dark:text-slate-600'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {rating === 1 && 'Enttäuschend'}
                {rating === 2 && 'Nicht gut'}
                {rating === 3 && 'Okay'}
                {rating === 4 && 'Gut'}
                {rating === 5 && 'Ausgezeichnet'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Kommentar (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Teilen Sie uns Ihre Gedanken mit..."
              className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                'Wird gesendet...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Senden
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};