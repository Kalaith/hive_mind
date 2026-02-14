import React from 'react';
import { useUIStore } from '../../stores/uiStore';

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-500';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            ${getNotificationStyles(notification.type)}
            border-l-4 p-4 rounded-lg shadow-lg transform transition-all duration-300
            animate-in slide-in-from-right
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                <p className="text-white/90 text-xs mt-1">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white/70 hover:text-white ml-2 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Progress bar for auto-dismiss */}
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/50 transition-all ease-linear"
              style={{
                width: '100%',
                animationName: 'notification-progress',
                animationDuration: `${notification.duration || 5000}ms`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
              }}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes notification-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-in {
          animation: slide-in-from-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;
