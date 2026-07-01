import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './EventDetail.css';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOrganizer } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);

  const loadEvent = () => {
    setLoading(true);
    api.get(`/api/events/${id}/`)
      .then(({ data }) => setEvent(data))
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  };

  const loadMyRegistration = () => {
    if (!user) return;
    api.get('/api/registrations/mine/').then(({ data }) => {
      const list = Array.isArray(data) ? data : data.results || [];
      const found = list.find((r) => String(r.event?.id ?? r.event) === String(id) && r.status !== 'cancelled');
      setMyRegistration(found || null);
    }).catch(() => {});
  };

  useEffect(() => { loadEvent(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => { loadMyRegistration(); /* eslint-disable-next-line */ }, [id, user]);

  const isOwner = user && event && (event.organizer === user.id || event.organizer?.id === user.id);
  const remaining = event ? event.capacity - (event.registered_count || 0) : 0;

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBooking(true);
    try {
      await api.post(`/api/registrations/events/${id}/register/`);
      toast.success('Ticket booked! Check My Tickets.');
      loadEvent();
      loadMyRegistration();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not book ticket');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async () => {
    if (!myRegistration) return;
    if (!confirm('Cancel this ticket?')) return;
    try {
      await api.delete(`/api/registrations/${myRegistration.id}/cancel/`);
      toast.success('Ticket cancelled');
      setMyRegistration(null);
      loadEvent();
    } catch {
      toast.error('Could not cancel ticket');
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Delete this event permanently?')) return;
    try {
      await api.delete(`/api/events/${id}/`);
      toast.success('Event deleted');
      navigate('/organizer/my-events');
    } catch {
      toast.error('Could not delete event');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!event) return <div className="empty-state"><h3>Event not found</h3></div>;

  return (
    <div className="page">
      <div className="container event-detail">
        <Link to="/events" className="back-link"><ArrowLeft size={15} /> Back to events</Link>

        <div className="detail-card card">
          <div className="detail-top">
            <h1 className="detail-title">{event.title}</h1>
            {isOwner && (
              <div className="owner-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/organizer/edit-event/${event.id}`)}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteEvent}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          <div className="detail-meta-row">
            <span className="meta-pill"><Calendar size={14} /> {format(new Date(event.start_time), 'EEEE, MMM d, yyyy')}</span>
            <span className="meta-pill"><Clock size={14} /> {format(new Date(event.start_time), 'h:mm a')} – {format(new Date(event.end_time), 'h:mm a')}</span>
            <span className="meta-pill"><Users size={14} /> {event.registered_count || 0} / {event.capacity} registered</span>
          </div>

          <p className="detail-desc">{event.description}</p>

          <div className="detail-footer">
            <div className="capacity-bar-wrap">
              <div className="capacity-bar">
                <div
                  className="capacity-fill"
                  style={{ width: `${Math.min(100, ((event.registered_count || 0) / event.capacity) * 100)}%` }}
                />
              </div>
              <span className="capacity-label">
                {remaining > 0 ? `${remaining} spot${remaining === 1 ? '' : 's'} remaining` : 'Fully booked'}
              </span>
            </div>

            {!isOwner && (
              myRegistration ? (
                <div className="booked-row">
                  <span className="badge badge-green">You're registered</span>
                  <button className="btn btn-danger btn-sm" onClick={handleCancel}>Cancel ticket</button>
                </div>
              ) : (
                <button
                  className="btn btn-primary book-btn"
                  onClick={handleBook}
                  disabled={booking || remaining <= 0}
                >
                  {remaining <= 0 ? 'Fully booked' : booking ? 'Booking…' : 'Book ticket'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}