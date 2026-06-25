import { CalendarClock, Pencil, Plus, Trash2, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, unpackList } from "../lib/api.js";
import EventForm from "./EventForm.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function EventsView({ onAuthNeeded }) {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canManage = Boolean(user?.is_organizer);

  async function loadEvents() {
    const payload = await apiRequest("/api/events/");
    setEvents(unpackList(payload));
  }

  useEffect(() => {
    loadEvents().catch((err) => setError(err.message));
  }, []);

  const selectedEvent = useMemo(() => selected || events[0] || null, [events, selected]);

  async function selectEvent(eventId) {
    setError("");
    try {
      const payload = await apiRequest(`/api/events/${eventId}/`);
      setSelected(payload);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createEvent(payload) {
    setBusy(true);
    setError("");
    try {
      const created = await apiRequest("/api/events/", { method: "POST", body: JSON.stringify(payload) });
      setMessage("Event created.");
      setShowCreate(false);
      setSelected(created);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateEvent(payload) {
    setBusy(true);
    setError("");
    try {
      const updated = await apiRequest(`/api/events/${editing.id}/`, { method: "PATCH", body: JSON.stringify(payload) });
      setMessage("Event updated.");
      setEditing(null);
      setSelected(updated);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteEvent(eventId) {
    if (!window.confirm("Delete this event?")) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/events/${eventId}/`, { method: "DELETE" });
      setMessage("Event deleted.");
      setSelected(null);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function registerForEvent(eventId) {
    if (!isAuthenticated) {
      onAuthNeeded?.();
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/registrations/events/${eventId}/register/`, { method: "POST", body: JSON.stringify({}) });
      setMessage("Registration confirmed. Your ticket is in My registrations.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workspace-grid">
      <section className="panel list-panel">
        <div className="section-heading">
          <div><p className="eyebrow">Events</p><h2>Explore schedule</h2></div>
          {canManage && <button className="icon-button" title="Create event" onClick={() => setShowCreate(true)} type="button"><Plus size={18} /></button>}
        </div>
        <div className="event-list">
          {events.map((event) => (
            <button className={`event-row ${selectedEvent?.id === event.id ? "active" : ""}`} key={event.id} onClick={() => selectEvent(event.id)} type="button">
              <span>{event.title}</span><small>{formatDate(event.start_time)}</small>
            </button>
          ))}
          {!events.length && <p className="empty">No events yet.</p>}
        </div>
      </section>

      <section className="panel detail-panel">
        {error && <p className="alert error">{error}</p>}
        {message && <p className="alert success">{message}</p>}
        {showCreate && <div className="inline-editor"><div className="section-heading"><h2>Create event</h2></div><EventForm onSubmit={createEvent} onCancel={() => setShowCreate(false)} busy={busy} /></div>}
        {editing && <div className="inline-editor"><div className="section-heading"><h2>Edit event</h2></div><EventForm initialEvent={editing} onSubmit={updateEvent} onCancel={() => setEditing(null)} busy={busy} /></div>}
        {!showCreate && !editing && selectedEvent && (
          <article className="event-detail">
            <div className="detail-kicker"><CalendarClock size={18} /> {formatDate(selectedEvent.start_time)}</div>
            <h1>{selectedEvent.title}</h1>
            <p>{selectedEvent.description}</p>
            <div className="stats-row"><span>Capacity: {selectedEvent.capacity}</span><span>{selectedEvent.is_published ? "Published" : "Draft"}</span><span>Organizer: {selectedEvent.organizer}</span></div>
            <div className="action-row">
              <button className="primary" disabled={busy} onClick={() => registerForEvent(selectedEvent.id)} type="button"><Ticket size={17} /> Register</button>
              {canManage && selectedEvent.organizer === user?.username && <><button className="ghost" onClick={() => setEditing(selectedEvent)} type="button"><Pencil size={16} /> Edit</button><button className="danger" disabled={busy} onClick={() => deleteEvent(selectedEvent.id)} type="button"><Trash2 size={16} /> Delete</button></>}
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
