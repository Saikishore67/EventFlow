import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const emptyRegister = {
  username: "",
  email: "",
  password: "",
  password2: "",
  is_organizer: false,
  is_attendee: true,
};

export default function AuthPanel({ onDone }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(loginForm);
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(registerForm);
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function setRole(role) {
    setRegisterForm((current) => ({
      ...current,
      is_organizer: role === "organizer",
      is_attendee: role === "attendee",
    }));
  }

  return (
    <section className="panel auth-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        </div>
        <div className="segmented" aria-label="Auth mode">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            <LogIn size={16} /> Login
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">
            <UserPlus size={16} /> Register
          </button>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}

      {mode === "login" ? (
        <form className="form-grid" onSubmit={submitLogin}>
          <label>Username<input value={loginForm.username} onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })} required /></label>
          <label>Password<input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required /></label>
          <button className="primary" disabled={busy} type="submit">Login</button>
        </form>
      ) : (
        <form className="form-grid" onSubmit={submitRegister}>
          <label>Username<input value={registerForm.username} onChange={(event) => setRegisterForm({ ...registerForm, username: event.target.value })} required /></label>
          <label>Email<input type="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} /></label>
          <label>Password<input type="password" value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} required /></label>
          <label>Confirm password<input type="password" value={registerForm.password2} onChange={(event) => setRegisterForm({ ...registerForm, password2: event.target.value })} required /></label>
          <div className="segmented role-select" aria-label="Role">
            <button className={registerForm.is_attendee ? "active" : ""} onClick={() => setRole("attendee")} type="button">Attendee</button>
            <button className={registerForm.is_organizer ? "active" : ""} onClick={() => setRole("organizer")} type="button">Organizer</button>
          </div>
          <button className="primary" disabled={busy} type="submit">Create account</button>
        </form>
      )}
    </section>
  );
}
