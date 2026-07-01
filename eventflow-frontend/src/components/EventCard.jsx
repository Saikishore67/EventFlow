import { Link } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import './EventCard.css';

function vacancyBadge(capacity, registered) {
  const remaining = capacity - (registered || 0);
  if (remaining <= 0) return { cls: 'badge-red', label: 'Full' };
  if (remaining <= 5) return { cls: 'badge-yellow', label: `${remaining} left` };
  return { cls: 'badge-green', label: `${remaining} open` };
}

export default function EventCard({ event }) {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const { cls, label } = vacancyBadge(event.capacity, event.registered_count);

  return (
    <Link to={`/events/${event.id}`} className="event-card card">
      <div className="event-card-header">
        <span className={`badge ${cls}`}>
          <Users size={11} /> {label}
        </span>
      </div>

      <h3 className="event-card-title">{event.title}</h3>
      <p className="event-card-desc">{event.description}</p>

      <div className="event-card-meta">
        <span className="meta-item">
          <Calendar size={13} />
          {format(start, 'MMM d, yyyy')}
        </span>
        <span className="meta-item">
          <Clock size={13} />
          {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
        </span>
        <span className="meta-item">
          <Users size={13} />
          {event.registered_count || 0} / {event.capacity}
        </span>
      </div>
    </Link>
  );
}