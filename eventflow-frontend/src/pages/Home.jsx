import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user, isOrganizer } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-eyebrow">Event management, simplified</div>
          <h1 className="hero-title">
            Where great<br />events begin
          </h1>
          <p className="hero-sub">
            Discover upcoming events, book your spot in seconds, and manage everything in one place.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary">Browse Events</Link>
            {!user && <Link to="/register" className="btn btn-ghost">Create an account</Link>}
            {user && isOrganizer && (
              <Link to="/organizer/create-event" className="btn btn-ghost">Create an Event</Link>
            )}
          </div>
        </div>
        <div className="hero-decoration" aria-hidden="true">
          <div className="deco-circle c1" />
          <div className="deco-circle c2" />
          <div className="deco-circle c3" />
        </div>
      </section>

      <section className="features container">
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">🎟️</span>
            <h3>Book in one tap</h3>
            <p>Register for any event instantly. Your ticket lands in My Tickets the moment you confirm.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📅</span>
            <h3>Stay in the loop</h3>
            <p>Get notified about changes to events you've registered for — no surprises.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛠️</span>
            <h3>Organizer tools</h3>
            <p>Create, edit, and manage your events. See real-time registration counts and capacity.</p>
          </div>
        </div>
      </section>
    </div>
  );
}