import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/client';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/api/notifications/')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setNotifications(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
      setNotifications((list) => list.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      toast.error('Could not update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all/');
      setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not update notifications');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header notif-header">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell />
            <h3>You're all caught up</h3>
            <p>New notifications will show up here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div key={n.id} className={`notif-item card ${!n.is_read ? 'notif-unread' : ''}`}>
                <div className="notif-content">
                  <p className="notif-text">{n.message || n.title || 'Notification'}</p>
                  <span className="notif-time">{n.created_at ? format(new Date(n.created_at), 'MMM d, h:mm a') : ''}</span>
                </div>
                {!n.is_read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)} title="Mark as read">
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}