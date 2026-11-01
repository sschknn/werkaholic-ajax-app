import React from 'react';
import { useNotifications } from '../contexts/notification/NotificationContext';

export const NotificationContainer: React.FC = () => {
  const { notifications, addNotification, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`p-4 rounded-xl ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{notification.type === 'success' ? '✓' : '!'}</span>
            <div>
              <p className="font-medium">{notification.title}</p>
              <p className="text-slate-300 text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-auto text-slate-300 hover:text-white transition-colors"
              >
                ✕
              </button>
          </div>
        </div>
      ))}
    </div>
  );
};
