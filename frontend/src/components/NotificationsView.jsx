import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest, unpackList } from "../lib/api.js";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NotificationsView() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  async function loadNotifications() {
    const payload = await apiRequest("/api/notifications/");
    setNotifications(unpackList(payload));
  }

  useEffect(() => {
    loadNotifications().catch((err) => setError(err.message));
  }, []);

  async function markRead(id) {
    await apiRequest(`/api/notifications/${id}/read/`, { method: "PATCH" });
    await loadNotifications();
  }

  async function markAllRead() {
    await apiRequest("/api/notifications/read-all/", { method: "PATCH" });
    await loadNotifications();
  }

  return (
    <section className="panel full-panel">
      <div className="section-heading">
        <div><p className="eyebrow">Inbox</p><h2>Notifications</h2></div>
        <button className="ghost" onClick={markAllRead} type="button"><CheckCheck size={16} /> Mark all read</button>
      </div>
      {error && <p className="alert error">{error}</p>}
      <div className="notification-stack">
        {notifications.map((notification) => (
          <article className={`notification-item ${notification.is_read ? "read" : "unread"}`} key={notification.id}>
            <div className="notification-icon"><Bell size={17} /></div>
            <div><h3>{notification.title}</h3><p>{notification.message}</p><small>{formatDate(notification.created_at)}</small></div>
            {!notification.is_read && <button className="ghost" onClick={() => markRead(notification.id)} type="button">Mark read</button>}
          </article>
        ))}
        {!notifications.length && <p className="empty">No notifications yet.</p>}
      </div>
    </section>
  );
}
