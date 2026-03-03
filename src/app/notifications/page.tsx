"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";

interface Notification {
    _id: string; type: string; title: string; message: string;
    isRead: boolean; link: string; createdAt: string;
}

const typeIcon: Record<string, string> = {
    alert: "🔔", report: "📋", anomaly: "⚠️", document: "📄",
    survey: "🔬", system: "⚙️", role: "👤",
};
const typeColor: Record<string, string> = {
    alert: "#dc2626", report: "#2563eb", anomaly: "#ea580c", document: "#7c3aed",
    survey: "#16a34a", system: "#6b7280", role: "#ca8a04",
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch { toast.error("Failed to load notifications"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const markRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch { /* silent */ }
    };

    const markAllRead = async () => {
        try {
            await api.patch("/notifications/read-all");
            setNotifications(n => n.map(x => ({ ...x, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch { toast.error("Failed"); }
    };

    const deleteNotif = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(n => n.filter(x => x._id !== id));
            toast.success("Notification removed");
        } catch { toast.error("Failed to delete"); }
    };

    const grouped = notifications.reduce((acc: Record<string, Notification[]>, n) => {
        const key = n.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(n);
        return acc;
    }, {});

    return (
        <ProtectedRoute>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    <div className="topbar">
                        <div>
                            <div className="topbar-title">
                                Notifications
                                {unreadCount > 0 && (
                                    <span style={{ marginLeft: 10, background: "#dc2626", color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{unreadCount}</span>
                                )}
                            </div>
                            <div className="topbar-subtitle">Your activity alerts and system messages</div>
                        </div>
                        {unreadCount > 0 && (
                            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all as read</button>
                        )}
                    </div>

                    <div className="page-wrapper">
                        {loading ? (
                            <div style={{ padding: 60, textAlign: "center" }}><div className="spinner" style={{ borderColor: "rgba(26,71,49,0.3)", borderTopColor: "#1a4731", width: 32, height: 32, margin: "0 auto" }} /></div>
                        ) : notifications.length === 0 ? (
                            <div className="card">
                                <div className="empty-state" style={{ padding: 80 }}>
                                    <div className="empty-state-icon">🔔</div>
                                    <div className="empty-state-text">No notifications yet</div>
                                    <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>You're all caught up!</div>
                                </div>
                            </div>
                        ) : (
                            Object.keys(typeIcon).map(type => {
                                const items = grouped[type];
                                if (!items || items.length === 0) return null;
                                return (
                                    <div key={type} className="card" style={{ marginBottom: 16 }}>
                                        <div className="card-header">
                                            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 16 }}>{typeIcon[type]}</span>
                                                <span style={{ textTransform: "capitalize" }}>{type}</span>
                                                <span style={{ background: `${typeColor[type]}18`, color: typeColor[type], borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{items.length}</span>
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                            {items.map((n, i) => (
                                                <div key={n._id} style={{
                                                    display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 20px",
                                                    background: n.isRead ? "transparent" : `${typeColor[n.type]}08`,
                                                    borderBottom: i < items.length - 1 ? "1px solid #f3f4f6" : "none",
                                                    cursor: n.isRead ? "default" : "pointer",
                                                }} onClick={() => !n.isRead && markRead(n._id)}>
                                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.isRead ? "transparent" : typeColor[n.type], marginTop: 6, flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 13, color: "#111827" }}>{n.title}</div>
                                                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{n.message}</div>
                                                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                                                        style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
