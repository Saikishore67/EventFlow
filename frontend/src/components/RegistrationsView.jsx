import { RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function RegistrationsView() {
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadRegistrations() {
    const payload = await apiRequest("/api/registrations/mine/");
    setRegistrations(payload);
  }

  useEffect(() => {
    loadRegistrations().catch((err) => setError(err.message));
  }, []);

  async function cancelRegistration(id) {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/registrations/${id}/cancel/`, { method: "DELETE" });
      setMessage("Registration cancelled.");
      await loadRegistrations();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel full-panel">
      <div className="section-heading">
        <div><p className="eyebrow">Tickets</p><h2>My registrations</h2></div>
        <button className="icon-button" title="Refresh" onClick={loadRegistrations} type="button"><RefreshCw size={18} /></button>
      </div>
      {error && <p className="alert error">{error}</p>}
      {message && <p className="alert success">{message}</p>}
      <div className="card-grid">
        {registrations.map((registration) => (
          <article className="data-card" key={registration.id}>
            <div><h3>{registration.event.title}</h3><p>{formatDate(registration.event.created_at)}</p></div>
            <div className="ticket-code">{registration.ticket_code}</div>
            {registration.qr_code && <img className="qr-code" src={registration.qr_code} alt={`QR code for ${registration.ticket_code}`} />}
            <button className="danger" disabled={busy} onClick={() => cancelRegistration(registration.id)} type="button"><XCircle size={16} /> Cancel</button>
          </article>
        ))}
        {!registrations.length && <p className="empty">No registrations yet.</p>}
      </div>
    </section>
  );
}
