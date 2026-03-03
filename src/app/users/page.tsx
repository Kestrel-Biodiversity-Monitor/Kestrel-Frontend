"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";

interface User {
    _id: string; name: string; email: string; role: string;
    organization: string; contributionScore: number; isActive: boolean; createdAt: string;
}

const roleColor: Record<string, string> = {
    admin: "#7c3aed", officer: "#2563eb", user: "#16a34a",
};

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const isAdmin = user?.role === "admin";

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data.users);
        } catch { toast.error("Failed to load users"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const filtered = users.filter(u => {
        const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const changeRole = async (userId: string, role: string) => {
        try { await api.patch(`/admin/users/${userId}/role`, { role }); toast.success("Role updated"); load(); }
        catch { toast.error("Failed to update role"); }
    };

    const toggleActive = async (userId: string) => {
        try { await api.patch(`/admin/users/${userId}/toggle-active`); toast.success("Status updated"); load(); }
        catch { toast.error("Failed"); }
    };

    return (
        <ProtectedRoute>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    <div className="topbar">
                        <div>
                            <div className="topbar-title">User Directory</div>
                            <div className="topbar-subtitle">All registered platform members</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 13, padding: "6px 10px", minWidth: 200 }} />
                            <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }}>
                                <option value="">All Roles</option>
                                <option value="user">User</option>
                                <option value="officer">Officer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="page-wrapper">
                        {/* Stats Row */}
                        <div className="grid-4" style={{ marginBottom: 20 }}>
                            {[
                                { label: "Total Users", value: users.length, icon: "👥", color: "#eff6ff" },
                                { label: "Officers", value: users.filter(u => u.role === "officer").length, icon: "🛡️", color: "#ede9fe" },
                                { label: "Admins", value: users.filter(u => u.role === "admin").length, icon: "⚙️", color: "#fef9c3" },
                                { label: "Active", value: users.filter(u => u.isActive).length, icon: "✅", color: "#f0fdf4" },
                            ].map(s => (
                                <div key={s.label} className="stat-card" style={{ background: s.color }}>
                                    <div className="stat-icon">{s.icon}</div>
                                    <div>
                                        <div className="stat-value">{loading ? "—" : s.value}</div>
                                        <div className="stat-label">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">Members ({filtered.length})</span>
                            </div>
                            {loading ? (
                                <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ borderColor: "rgba(26,71,49,0.3)", borderTopColor: "#1a4731", width: 32, height: 32, margin: "0 auto" }} /></div>
                            ) : filtered.length === 0 ? (
                                <div className="empty-state" style={{ padding: 60 }}>
                                    <div className="empty-state-icon">👥</div>
                                    <div className="empty-state-text">No users found</div>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Organization</th><th>Score</th><th>Status</th><th>Joined</th>{isAdmin && <th>Actions</th>}</tr></thead>
                                    <tbody>
                                        {filtered.map(u => (
                                            <tr key={u._id}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${roleColor[u.role]}20`, border: `2px solid ${roleColor[u.role]}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: roleColor[u.role] }}>
                                                            {u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{u.name}</div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</td>
                                                <td>
                                                    <span style={{ background: `${roleColor[u.role]}18`, color: roleColor[u.role], borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${roleColor[u.role]}40` }}>{u.role}</span>
                                                </td>
                                                <td style={{ fontSize: 12, color: "#6b7280" }}>{u.organization || "—"}</td>
                                                <td style={{ fontWeight: 700, color: "#1a4731", fontSize: 13 }}>{u.contributionScore}</td>
                                                <td>
                                                    <span style={{ background: u.isActive ? "#f0fdf4" : "#fef2f2", color: u.isActive ? "#16a34a" : "#dc2626", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${u.isActive ? "#bbf7d0" : "#fecaca"}` }}>
                                                        {u.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                {isAdmin && (
                                                    <td>
                                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                            {u.role === "user" && <button className="btn btn-sm btn-secondary" onClick={() => changeRole(u._id, "officer")}>→ Officer</button>}
                                                            {u.role === "officer" && <button className="btn btn-sm btn-secondary" onClick={() => changeRole(u._id, "user")}>→ User</button>}
                                                            <button className="btn btn-sm" style={{ background: u.isActive ? "#fee2e2" : "#f0fdf4", color: u.isActive ? "#dc2626" : "#16a34a", border: "none" }} onClick={() => toggleActive(u._id)}>
                                                                {u.isActive ? "Deactivate" : "Activate"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
