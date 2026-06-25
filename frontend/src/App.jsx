import { Bell, CalendarDays, LogOut, Ticket, UserCircle } from "lucide-react";
import { useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import EventsView from "./components/EventsView.jsx";
import NotificationsView from "./components/NotificationsView.jsx";
import RegistrationsView from "./components/RegistrationsView.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const tabs = [
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "registrations", label: "My registrations", icon: Ticket, protected: true },
  { id: "notifications", label: "Notifications", icon: Bell, protected: true },
];

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [showAuth, setShowAuth] = useState(false);

  function openTab(tab) {
    if (tab.protected && !isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setActiveTab(tab.id);
    setShowAuth(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">EF</div>
          <div><h1>EventFlow</h1><p>Events, tickets, and updates in one place</p></div>
        </div>
        <nav className="tabbar" aria-label="Primary navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return <button key={tab.id} className={activeTab === tab.id && !showAuth ? "active" : ""} onClick={() => openTab(tab)} type="button"><Icon size={17} /> {tab.label}</button>;
          })}
        </nav>
        <div className="account-box">
          {isAuthenticated ? (
            <><UserCircle size={18} /><span>{user?.username || "Signed in"}</span><button className="icon-button" title="Logout" onClick={logout} type="button"><LogOut size={17} /></button></>
          ) : (
            <button className="primary" onClick={() => setShowAuth(true)} type="button">Login</button>
          )}
        </div>
      </header>
      <main>
        {showAuth && <AuthPanel onDone={() => setShowAuth(false)} />}
        {!showAuth && activeTab === "events" && <EventsView onAuthNeeded={() => setShowAuth(true)} />}
        {!showAuth && activeTab === "registrations" && <RegistrationsView />}
        {!showAuth && activeTab === "notifications" && <NotificationsView />}
      </main>
    </div>
  );
}
