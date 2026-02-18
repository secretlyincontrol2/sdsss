import { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api';
import { Calendar, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ event_name: '', description: '', start_date: '', end_date: '' });
    const [success, setSuccess] = useState('');

    useEffect(() => { loadEvents(); }, []);

    const loadEvents = async () => {
        try {
            const res = await calendarAPI.list();
            setEvents(res.data.events);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await calendarAPI.update(editId, form);
                setSuccess('Event updated');
            } else {
                await calendarAPI.create(form);
                setSuccess('Event created');
            }
            setShowForm(false);
            setEditId(null);
            setForm({ event_name: '', description: '', start_date: '', end_date: '' });
            loadEvents();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            console.error(e);
        }
    };

    const startEdit = (evt) => {
        setForm({ event_name: evt.event_name, description: evt.description || '', start_date: evt.start_date, end_date: evt.end_date || '' });
        setEditId(evt.id);
        setShowForm(true);
    };

    const deleteEvent = async (id) => {
        if (!confirm('Delete this event?')) return;
        try {
            await calendarAPI.delete(id);
            loadEvents();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    const upcoming = events.filter(e => new Date(e.start_date) >= new Date());
    const past = events.filter(e => new Date(e.start_date) < new Date());

    return (
        <div>
            {success && <div className="alert alert-success"><CheckCircle size={16} /> {success}</div>}

            <div className="flex-between mb-3">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Academic Calendar</h2>
                <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ event_name: '', description: '', start_date: '', end_date: '' }); }}>
                    <Plus size={16} /> Add Event
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Event' : 'New Event'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={submitForm}>
                            <div className="modal-body">
                                <div className="form-group"><label>Event Name</label><input type="text" value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} required /></div>
                                <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                                <div className="form-row">
                                    <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required /></div>
                                    <div className="form-group"><label>End Date</label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upcoming Events */}
            <div className="card mb-3">
                <div className="card-header"><h3>Upcoming Events ({upcoming.length})</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                    {upcoming.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}><p>No upcoming events</p></div>
                    ) : (
                        upcoming.map(evt => (
                            <div key={evt.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'rgba(66,153,225,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: '0.688rem', color: 'var(--accent)', fontWeight: 700 }}>{new Date(evt.start_date).toLocaleString('default', { month: 'short' })}</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{new Date(evt.start_date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600, fontSize: '0.938rem' }}>{evt.event_name}</h4>
                                        {evt.description && <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>{evt.description}</p>}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(evt.start_date).toLocaleDateString()}
                                            {evt.end_date && evt.end_date !== evt.start_date && ` — ${new Date(evt.end_date).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(evt)} style={{ padding: '6px 10px' }}><Edit2 size={14} /></button>
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(evt.id)} style={{ padding: '6px 10px' }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Past Events */}
            {past.length > 0 && (
                <div className="card">
                    <div className="card-header"><h3>Past Events ({past.length})</h3></div>
                    <div className="card-body" style={{ padding: 0, opacity: 0.6 }}>
                        {past.map(evt => (
                            <div key={evt.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-light)' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{evt.event_name}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(evt.start_date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
