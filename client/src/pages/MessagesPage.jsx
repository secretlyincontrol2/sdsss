import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI, adminAPI } from '../services/api';
import { Send, MessageSquare, Search } from 'lucide-react';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activePartner, setActivePartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const chatEndRef = useRef();

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!activePartner) return;
        const interval = setInterval(async () => {
            try {
                const res = await messageAPI.conversation(activePartner.id);
                // Update messages only if count differs or last message differs to avoid scroll jumps?
                // For now, simple update. React reconciliation handles DOM updates.
                setMessages(res.data.messages);
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activePartner]);

    const loadConversations = async () => {
        try {
            const res = await messageAPI.list();
            setConversations(res.data.conversations);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openConversation = async (partnerId, partnerName) => {
        setActivePartner({ id: partnerId, name: partnerName });
        setShowNewChat(false);
        try {
            const res = await messageAPI.conversation(partnerId);
            setMessages(res.data.messages);
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activePartner) return;
        try {
            await messageAPI.send({ receiver_id: activePartner.id, body: newMessage });
            setNewMessage('');
            const res = await messageAPI.conversation(activePartner.id);
            setMessages(res.data.messages);
            loadConversations();
        } catch (e) {
            console.error(e);
        }
    };

    const startNewChat = async () => {
        setShowNewChat(true);
        if (users.length === 0) {
            try {
                // For non-admin, we need to fetch available users via a different approach
                // We'll re-use the admin endpoint but gracefully handle it
                const res = await adminAPI.listUsers();
                setUsers(res.data.users.filter(u => u.id !== user.id));
            } catch (e) {
                // Non-admin can't list all users, show existing conversations only
                setShowNewChat(false);
            }
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    return (
        <div className="messages-layout">
            {/* Conversation List */}
            <div className="conversation-list">
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
                    <div className="flex-between">
                        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Messages</h3>
                        <button className="btn btn-primary btn-sm" onClick={startNewChat} style={{ padding: '6px 10px' }}>
                            <MessageSquare size={14} />
                        </button>
                    </div>
                </div>

                {showNewChat && users.length > 0 && (
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg)' }}>
                        <p style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>New Conversation</p>
                        {users.slice(0, 10).map(u => (
                            <div
                                key={u.id}
                                className="conversation-item"
                                style={{ padding: '8px 12px' }}
                                onClick={() => openConversation(u.id, `${u.first_name} ${u.last_name}`)}
                            >
                                <h4 style={{ fontSize: '0.813rem' }}>{u.first_name} {u.last_name}</h4>
                                <p style={{ fontSize: '0.688rem' }}>{u.role}</p>
                            </div>
                        ))}
                    </div>
                )}

                {conversations.length === 0 && !showNewChat ? (
                    <div className="empty-state" style={{ padding: 24 }}>
                        <MessageSquare size={32} />
                        <p style={{ fontSize: '0.813rem' }}>No conversations yet</p>
                    </div>
                ) : (
                    conversations.map(c => (
                        <div
                            key={c.partner_id}
                            className={`conversation-item ${activePartner?.id == c.partner_id ? 'active' : ''}`}
                            onClick={() => openConversation(c.partner_id, `${c.partner_first} ${c.partner_last}`)}
                        >
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                                    {c.partner_first?.[0]}{c.partner_last?.[0]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4>{c.partner_first} {c.partner_last}</h4>
                                    <p>{c.body}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Area */}
            <div className="chat-area">
                {activePartner ? (
                    <>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontWeight: 700 }}>
                            {activePartner.name}
                        </div>
                        <div className="chat-messages">
                            {messages.map(m => (
                                <div key={m.id} className={`message-bubble ${m.sender_id == user.id ? 'sent' : 'received'}`}>
                                    <p>{m.body}</p>
                                    <div className="message-time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="chat-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            />
                            <button className="btn btn-primary" onClick={sendMessage}><Send size={16} /></button>
                        </div>
                    </>
                ) : (
                    <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
                        <MessageSquare size={48} />
                        <h3 style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Select a conversation</h3>
                        <p style={{ fontSize: '0.875rem' }}>Choose a conversation from the left or start a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
}
