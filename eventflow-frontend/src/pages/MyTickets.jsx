import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Ticket, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/client';
import './MyTickets.css';

export default function MyTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/api/registrations/mine/')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setRegistrations(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (regId) => {
    if (!confirm('Cancel this ticket?')) return;
    try {
      await api.delete(`/api/registrations/${regId}/cancel/`);
      toast.success('Ticket cancelled');
      load();
    } catch {
      toast.error('Could not cancel ticket');
    }
  };

  const active = registrations.filter((r) => r.status !== 'cancelled');

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Tickets</h1>
          <p className="page-subtitle">{active.length} active ticket{active.length === 1 ? '' : 's'}</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            <Ticket />
            <h3>No tickets yet</h3>
            <p>Browse events and book your first ticket.</p>
            <Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse events</Link>
          </div>
        ) : (
          <div className="tickets-list">
            {registrations.map((reg) => {
              const ev = reg.event_detail || reg.event;
              if (!ev || typeof ev !== 'object') return null;
              const cancelled = reg.status === 'cancelled';
              return (
                <div key={reg.id} className={`ticket-row card ${cancelled ? 'ticket-cancelled' : ''}`}>
                  <div className="ticket-stub">
                    <Ticket size={20} />
                  </div>
                  <div className="ticket-info">
                    <Link to={`/events/${ev.id}`} className="ticket-title">{ev.title}</Link>
                    <div className="ticket-meta">
                      <span><Calendar size={12} /> {format(new Date(ev.start_time), 'MMM d, yyyy')}</span>
                      <span><Clock size={12} /> {format(new Date(ev.start_time), 'h:mm a')}</span>
                    </div>
                  </div>
                  <div className="ticket-status">
                    {cancelled ? (
                      <span className="badge badge-red">Cancelled</span>
                    ) : (
                      <>
                        <span className="badge badge-green">Confirmed</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(reg.id)}>
                          <X size={13} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}