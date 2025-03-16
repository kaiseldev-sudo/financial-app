import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { Bell, X, AlertCircle, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATION_TYPES = {
  TRANSACTION: 'transaction',
  MARKET_ALERT: 'market_alert',
  BUDGET_ALERT: 'budget_alert',
  ACCOUNT: 'account'
};

const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.TRANSACTION]: DollarSign,
  [NOTIFICATION_TYPES.MARKET_ALERT]: TrendingUp,
  [NOTIFICATION_TYPES.BUDGET_ALERT]: Wallet,
  [NOTIFICATION_TYPES.ACCOUNT]: AlertCircle
};

export default function NotificationCenter() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, [user]);

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    }
  }

  function subscribeToNotifications() {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        setNotifications(current => [payload.new, ...current]);
        setUnreadCount(count => count + 1);
        showToast(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(current =>
        current.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  function showToast(notification) {
    // Implement toast notification here
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 
                         bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center 
                         justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg 
                     overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => {
                  const Icon = NOTIFICATION_ICONS[notification.type] || AlertCircle;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 
                                ${notification.read ? 'opacity-75' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 ${
                          notification.read ? 'text-gray-400' : 'text-emerald-500'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm ${
                            notification.read ? 'text-gray-500' : 'text-gray-800'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 