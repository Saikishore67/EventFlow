import { useEffect, useState } from "react";

const blankEvent = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  capacity: 50,
  is_published: true,
};

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export default function EventForm({ initialEvent, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(blankEvent);

  useEffect(() => {
    if (!initialEvent) {
      setForm(blankEvent);
      return;
    }
    setForm({
      title: initialEvent.title || "",
      description: initialEvent.description || "",
      start_time: toInputDate(initialEvent.start_time),
      end_time: toInputDate(initialEvent.end_time),
      capacity: initialEvent.capacity || 50,
      is_published: Boolean(initialEvent.is_published),
    });
  }, [initialEvent]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      capacity: Number(form.capacity),
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
    });
  }

  return (
    <form className="event-form" onSubmit={submit}>
      <label>Title<input value={form.title} onChange={(event) => updateField("title", event.target.value)} required /></label>
      <label>Description<textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required rows="4" /></label>
      <div className="two-col">
        <label>Starts<input type="datetime-local" value={form.start_time} onChange={(event) => updateField("start_time", event.target.value)} required /></label>
        <label>Ends<input type="datetime-local" value={form.end_time} onChange={(event) => updateField("end_time", event.target.value)} required /></label>
      </div>
      <div className="two-col compact-row">
        <label>Capacity<input type="number" min="1" value={form.capacity} onChange={(event) => updateField("capacity", event.target.value)} required /></label>
        <label className="checkbox-line"><input type="checkbox" checked={form.is_published} onChange={(event) => updateField("is_published", event.target.checked)} />Published</label>
      </div>
      <div className="action-row">
        {onCancel && <button type="button" className="ghost" onClick={onCancel}>Cancel</button>}
        <button className="primary" disabled={busy} type="submit">{initialEvent ? "Save event" : "Create event"}</button>
      </div>
    </form>
  );
}
