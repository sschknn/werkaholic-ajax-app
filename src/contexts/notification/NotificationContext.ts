import React, { createContext, useContext } from 'react';

interface NotificationContextType {
  notifications: any[];
  addNotification: (note: any) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const addNotification = (note: any) => setNotifications(n => n.concat(note));
  const removeNotification = (id: string) => setNotifications(n => n.filter(n => n.id !== id));
  return children;
};
