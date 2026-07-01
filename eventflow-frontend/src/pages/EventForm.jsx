import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import './EventForm.css';

const emptyForm = {
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  capacity: 50,
};

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/events/${id}/`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          start_time: toLocalInput(data.start_time),
          end_time: toLocalInput(data.end_time),
          capacity: data.capacity,
        });
      })
      .catch(() => toast.error('Could not load event'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'capacity' ? value.replace(/\D/g, '') : value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.start_time) errs.start_time = 'Start time is required';
    if (!form.end_time) errs.end_time = 'End time is required';
    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
      errs.end_time = 'End time must be after start time';
    }
    if (!form.capacity || Number(form.capacity) < 1) errs.capacity = 'Capacity must be at least 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      capacity: Number(form.capacity),
    };
    try {
      if (isEdit) {
        await api.patch(`/api/events/${id}/`, payload);
        toast.success('Event updated');
        navigate(`/events/${id}`);
      } else {
        const { data } = await api.post('/api/events/', payload);
        toast.success('Event created');
        navigate(`/events/${data.id}`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        toast.error('Please fix the errors below');
      } else {
        toast.error('Could not save event');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update your event details' : 'Fill in the details for your new event'}</p>
        </div>

        <form className="event-form card" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handle} placeholder="e.g. Summer Tech Meetup" />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handle}
              placeholder="What's this event about?"
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="start_time">Start time</label>
              <input id="start_time" name="start_time" type="datetime-local" value={form.start_time} onChange={handle} />
              {errors.start_time && <span className="form-error">{errors.start_time}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="end_time">End time</label>
              <input id="end_time" name="end_time" type="datetime-local" value={form.end_time} onChange={handle} />
              {errors.end_time && <span className="form-error">{errors.end_time}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="capacity">Capacity</label>
            <input id="capacity" name="capacity" type="number" min="1" value={form.capacity} onChange={handle} placeholder="50" />
            {errors.capacity && <span className="form-error">{errors.capacity}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}