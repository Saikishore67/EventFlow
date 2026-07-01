import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/client';
import EventCard from '../components/EventCard';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/events/')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setEvents(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header events-header">
          <div>
            <h1 className="page-title">All Events</h1>
            <p className="page-subtitle">{events.length} events available</p>
          </div>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search />
            <h3>{search ? 'No results found' : 'No events yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Check back soon for upcoming events.'}</p>
          </div>
        ) : (
          <div className="events-grid">
            {filtered.map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </div>
    </div>
  );
}