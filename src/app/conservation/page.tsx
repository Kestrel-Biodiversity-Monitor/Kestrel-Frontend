"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";

interface Region { _id: string; name: string; }
interface Zone {
    _id: string; name: string; regionName: string; zoneType: string; area: number;
    establishedYear?: number; threatLevel: string; description: string;
    managingAuthority: string; createdBy?: { name: string }; createdAt: string;
}

const ZONE_TYPES = ["National Park", "Wildlife Sanctuary", "Biosphere Reserve", "Ramsar Site", "Community Reserve", "Tiger Reserve", "Marine Park", "Other"];
const THREAT_LEVELS = ["Low", "Medium", "High", "Critical"];

const threatColor: Record<string, string> = {
    Low: "#16a34a", Medium: "#ca8a04", High: "#ea580c", Critical: "#dc2626",
};
const zoneIcon: Record<string, string> = {
    "National Park": "🏞️", "Wildlife Sanctuary": "🦁", "Biosphere Reserve": "🌿",
    "Ramsar Site": "🌊", "Community Reserve": "👥", "Tiger Reserve": "🐯",
    "Marine Park": "🐠", "Other": "🛡️",
};

const emptyForm = { name: "", regionName: "", zoneType: "Wildlife Sanctuary", area: "", establishedYear: "", threatLevel: "Low", description: "", managingAuthority: "" };

export default function ConservationPage() {
    const { user } = useAuth();
    const [zones, setZones] = useState<Zone[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editZone, setEditZone] = useState<Zone | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [threatFilter, setThreatFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const canManage = user?.role === "officer" || user?.role === "admin";
    const canDelete = user?.role === "admin";

    const load = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (threatFilter) params.set("threatLevel", threatFilter);
            if (typeFilter) params.set("zoneType", typeFilter);
            const res = await api.get(`/conservation?${params.toString()}`);
            setZones(res.data.zones);
        } catch { toast.error("Failed to load zones"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        api.get("/regions?limit=100").then(r => setRegions(r.data.regions)).catch(() => { });
    }, [threatFilter, typeFilter]);

    const openEdit = (z: Zone) => {
        setForm({ name: z.name, regionName: z.regionName, zoneType: z.zoneType, area: String(z.area), establishedYear: String(z.establishedYear || ""), threatLevel: z.threatLevel, description: z.description, managingAuthority: z.managingAuthority });
        setEditZone(z); setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Zone name is required");
        setSaving(true);
        try {
            const payload = { ...form, area: Number(form.area) || 0, establishedYear: Number(form.establishedYear) || undefined };
            if (editZone) { await api.put(`/conservation/${editZone._id}`, payload); toast.success("Zone updated"); }
            else { await api.post("/conservation", payload); toast.success("Zone created"); }
            setShowForm(false); load();
        } catch (err: any) { toast.error(err.response?.data?.message || "Failed to save"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this conservation zone?")) return;
        try { await api.delete(`/conservation/${id}`); toast.success("Deleted"); load(); }
        catch { toast.error("Delete failed"); }
    };

    return (
        <ProtectedRoute>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    <div className="topbar">
                        <div>
                            <div className="topbar-title">Conservation Zones</div>
                            <div className="topbar-subtitle">Protected areas, sanctuaries, and biosphere reserves</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }}>
                                <option value="">All Types</option>
                                {ZONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select className="form-select" value={threatFilter} onChange={e => setThreatFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }}>
                                <option value="">All Threat Levels</option>
                                {THREAT_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {canManage && <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setEditZone(null); setShowForm(true); }}>+ Add Zone</button>}
                        </div>
                    </div>

                    <div className="page-wrapper">
                        {showForm && canManage && (
                            <div className="card" style={{ marginBottom: 20 }}>
                                <div className="card-header">
                                    <span className="card-title">{editZone ? "Edit Conservation Zone" : "Add Conservation Zone"}</span>
                                    <button className="btn btn-sm btn-ghost" onClick={() => setShowForm(false)}>✕</button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid-2" style={{ marginBottom: 12 }}>
                                        <div className="form-group"><label className="form-label">Zone Name *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Jim Corbett National Park" /></div>
                                        <div className="form-group">
                                            <label className="form-label">Region</label>
                                            {regions.length > 0 ? (
                                                <select className="form-select" value={form.regionName} onChange={e => setForm(f => ({ ...f, regionName: e.target.value }))}>
                                                    <option value="">Select region…</option>
                                                    {regions.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                                                </select>
                                            ) : <input className="form-input" value={form.regionName} onChange={e => setForm(f => ({ ...f, regionName: e.target.value }))} placeholder="Region name" />}
                                        </div>
                                        <div className="form-group"><label className="form-label">Zone Type</label>
                                            <select className="form-select" value={form.zoneType} onChange={e => setForm(f => ({ ...f, zoneType: e.target.value }))}>
                                                {ZONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group"><label className="form-label">Threat Level</label>
                                            <select className="form-select" value={form.threatLevel} onChange={e => setForm(f => ({ ...f, threatLevel: e.target.value }))}>
                                                {THREAT_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group"><label className="form-label">Area (km²)</label><input className="form-input" type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} min="0" /></div>
                                        <div className="form-group"><label className="form-label">Established Year</label><input className="form-input" type="number" value={form.establishedYear} onChange={e => setForm(f => ({ ...f, establishedYear: e.target.value }))} placeholder="e.g. 1973" min="1800" max="2025" /></div>
                                        <div className="form-group"><label className="form-label">Managing Authority</label><input className="form-input" value={form.managingAuthority} onChange={e => setForm(f => ({ ...f, managingAuthority: e.target.value }))} placeholder="e.g. Forest Department of Uttarakhand" /></div>
                                    </div>
                                    <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details about this conservation zone..." style={{ minHeight: 72 }} /></div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editZone ? "Update Zone" : "Add Zone"}</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="card">
                            <div className="card-header"><span className="card-title">Conservation Zones ({zones.length})</span></div>
                            {loading ? (
                                <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ borderColor: "rgba(26,71,49,0.3)", borderTopColor: "#1a4731", width: 32, height: 32, margin: "0 auto" }} /></div>
                            ) : zones.length === 0 ? (
                                <div className="empty-state" style={{ padding: 60 }}>
                                    <div className="empty-state-icon">🛡️</div>
                                    <div className="empty-state-text">No conservation zones found</div>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead><tr><th>Zone</th><th>Type</th><th>Region</th><th>Area (km²)</th><th>Est. Year</th><th>Threat</th><th>Authority</th>{canManage && <th>Actions</th>}</tr></thead>
                                    <tbody>
                                        {zones.map(z => (
                                            <tr key={z._id}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ fontSize: 18 }}>{zoneIcon[z.zoneType] || "🛡️"}</span>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{z.name}</div>
                                                            {z.description && <div style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}>{z.description.slice(0, 50)}…</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: 12, color: "#374151" }}>{z.zoneType}</td>
                                                <td style={{ fontSize: 12, color: "#374151" }}>{z.regionName || "—"}</td>
                                                <td style={{ fontSize: 12, color: "#6b7280" }}>{z.area > 0 ? z.area.toLocaleString() : "—"}</td>
                                                <td style={{ fontSize: 12, color: "#6b7280" }}>{z.establishedYear || "—"}</td>
                                                <td>
                                                    <span style={{ background: `${threatColor[z.threatLevel]}18`, color: threatColor[z.threatLevel], borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${threatColor[z.threatLevel]}40` }}>{z.threatLevel}</span>
                                                </td>
                                                <td style={{ fontSize: 12, color: "#6b7280" }}>{z.managingAuthority || "—"}</td>
                                                {canManage && (
                                                    <td><div style={{ display: "flex", gap: 6 }}>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(z)}>Edit</button>
                                                        {canDelete && <button className="btn btn-sm" style={{ background: "#fee2e2", color: "#dc2626", border: "none" }} onClick={() => handleDelete(z._id)}>Del</button>}
                                                    </div></td>
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
