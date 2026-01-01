import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from './ui';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'ring-2 ring-red-500 ring-opacity-50';
      case 'high':
        return 'ring-1 ring-orange-500 ring-opacity-30';
      case 'low':
        return 'opacity-75';
      default:
        return '';
    }
  };

  const getStyles = (type: string, priority?: string) => {
    let baseStyles = '';
    switch (type) {
      case 'success':
        baseStyles = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        break;
      case 'error':
        baseStyles = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        break;
      case 'warning':
        baseStyles = 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        break;
      case 'info':
      default:
        baseStyles = 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        break;
    }
    return `${baseStyles} ${getPriorityStyles(priority)}`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-right-2 duration-300 ${getStyles(notification.type, notification.priority)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {notification.title}
                  {notification.priority === 'urgent' && (
                    <Bell className="w-3 h-3 ml-2 inline text-red-500" />
                  )}
                </p>
                {notification.category && (
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {notification.category}
                  </span>
                )}
              </div>
              {notification.message && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {notification.message}
                </p>
              )}
              {(notification.action || notification.actions) && (
                <div className="flex gap-2 mt-3">
                  {notification.action && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={notification.action.onClick}
                    >
                      {notification.action.label}
                    </Button>
                  )}
                  {notification.actions?.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={action.variant === 'secondary' ? 'outline' : 'ghost'}
                      className="h-8 px-2 text-xs"
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {!notification.persistent && (
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Benachrichtigung schließen"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};