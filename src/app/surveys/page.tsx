"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";

interface Region { _id: string; name: string; }
interface Survey {
    _id: string; title: string; regionName: string; surveyType: string;
    startDate: string; endDate?: string; status: string; description: string;
    findings: string; speciesObserved: number;
    leadOfficer?: { name: string }; createdBy?: { name: string }; createdAt: string;
}

const SURVEY_TYPES = ["Biodiversity", "Camera Trap", "Aerial", "Water Quality", "Botanical", "Other"];
const STATUSES = ["planned", "ongoing", "completed", "cancelled"];

const statusColor: Record<string, string> = {
    planned: "#2563eb", ongoing: "#ca8a04", completed: "#16a34a", cancelled: "#6b7280",
};
const emptyForm = { title: "", regionName: "", surveyType: "Biodiversity", startDate: "", endDate: "", description: "", findings: "", speciesObserved: "0", status: "planned" };

export default function SurveysPage() {
    const { user } = useAuth();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editSurvey, setEditSurvey] = useState<Survey | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const canManage = user?.role === "officer" || user?.role === "admin";
    const canDelete = user?.role === "admin";

    const loadSurveys = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            if (typeFilter) params.set("surveyType", typeFilter);
            const res = await api.get(`/surveys?${params.toString()}`);
            setSurveys(res.data.surveys);
        } catch { toast.error("Failed to load surveys"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        loadSurveys();
        api.get("/regions?limit=100").then(r => setRegions(r.data.regions)).catch(() => { });
    }, [statusFilter, typeFilter]);

    const openCreate = () => { setForm(emptyForm); setEditSurvey(null); setShowForm(true); };
    const openEdit = (s: Survey) => {
        setForm({
            title: s.title, regionName: s.regionName, surveyType: s.surveyType,
            startDate: s.startDate?.slice(0, 10), endDate: s.endDate?.slice(0, 10) || "",
            description: s.description, findings: s.findings, speciesObserved: String(s.speciesObserved), status: s.status,
        });
        setEditSurvey(s); setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.startDate) return toast.error("Title and start date are required");
        setSaving(true);
        try {
            const payload = { ...form, speciesObserved: Number(form.speciesObserved) };
            if (editSurvey) { await api.put(`/surveys/${editSurvey._id}`, payload); toast.success("Survey updated"); }
            else { await api.post("/surveys", payload); toast.success("Survey created"); }
            setShowForm(false); loadSurveys();
        } catch (err: any) { toast.error(err.response?.data?.message || "Failed to save"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this survey?")) return;
        try { await api.delete(`/surveys/${id}`); toast.success("Deleted"); loadSurveys(); }
        catch { toast.error("Delete failed"); }
    };

    return (
        <ProtectedRoute>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    <div className="topbar">
                        <div>
                            <div className="topbar-title">Surveys</div>
                            <div className="topbar-subtitle">Field survey planning and management</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }}>
                                <option value="">All Statuses</option>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }}>
                                <option value="">All Types</option>
                                {SURVEY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {canManage && <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Create Survey</button>}
                        </div>
                    </div>

                    <div className="page-wrapper">
                        {showForm && canManage && (
                            <div className="card" style={{ marginBottom: 20 }}>
                                <div className="card-header">
                                    <span className="card-title">{editSurvey ? "Edit Survey" : "Create New Survey"}</span>
                                    <button className="btn btn-sm btn-ghost" onClick={() => setShowForm(false)}>✕</button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid-2" style={{ marginBottom: 12 }}>
                                        <div className="form-group">
                                            <label className="form-label">Survey Title *</label>
                                            <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Western Ghats Biodiversity Survey" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Region</label>
                                            {regions.length > 0 ? (
                                                <select className="form-select" value={form.regionName} onChange={e => setForm(f => ({ ...f, regionName: e.target.value }))}>
                                                    <option value="">Select region…</option>
                                                    {regions.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                                                </select>
                                            ) : <input className="form-input" value={form.regionName} onChange={e => setForm(f => ({ ...f, regionName: e.target.value }))} placeholder="Region name" />}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Survey Type</label>
                                            <select className="form-select" value={form.surveyType} onChange={e => setForm(f => ({ ...f, surveyType: e.target.value }))}>
                                                {SURVEY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Status</label>
                                            <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Start Date *</label>
                                            <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">End Date</label>
                                            <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Species Observed</label>
                                            <input className="form-input" type="number" value={form.speciesObserved} onChange={e => setForm(f => ({ ...f, speciesObserved: e.target.value }))} min="0" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Survey objectives, area coverage, methodology..." style={{ minHeight: 72 }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Findings / Results</label>
                                        <textarea className="form-textarea" value={form.findings} onChange={e => setForm(f => ({ ...f, findings: e.target.value }))} placeholder="Key findings, notable species observed, recommendations..." style={{ minHeight: 72 }} />
                                    </div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : editSurvey ? "Update" : "Create Survey"}</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="card">
                            <div className="card-header"><span className="card-title">Surveys ({surveys.length})</span></div>
                            {loading ? (
                                <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ borderColor: "rgba(26,71,49,0.3)", borderTopColor: "#1a4731", width: 32, height: 32, margin: "0 auto" }} /></div>
                            ) : surveys.length === 0 ? (
                                <div className="empty-state" style={{ padding: 60 }}>
                                    <div className="empty-state-icon">🔬</div>
                                    <div className="empty-state-text">No surveys found</div>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead><tr><th>Title</th><th>Region</th><th>Type</th><th>Status</th><th>Start Date</th><th>End Date</th><th>Species</th><th>Created By</th>{canManage && <th>Actions</th>}</tr></thead>
                                    <tbody>
                                        {surveys.map(s => (
                                            <tr key={s._id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{s.title}</div>
                                                    {s.description && <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{s.description.slice(0, 60)}{s.description.length > 60 ? "…" : ""}</div>}
                                                </td>
                                                <td style={{ fontSize: 12, color: "#374151" }}>{s.regionName || "—"}</td>
                                                <td style={{ fontSize: 12 }}>{s.surveyType}</td>
                                                <td>
                                                    <span style={{ background: `${statusColor[s.status]}18`, color: statusColor[s.status], borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${statusColor[s.status]}40` }}>{s.status}</span>
                                                </td>
                                                <td style={{ fontSize: 11, color: "#6b7280" }}>{new Date(s.startDate).toLocaleDateString()}</td>
                                                <td style={{ fontSize: 11, color: "#6b7280" }}>{s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}</td>
                                                <td style={{ fontSize: 13, fontWeight: 600, color: "#1a4731", textAlign: "center" }}>{s.speciesObserved}</td>
                                                <td style={{ fontSize: 12, color: "#374151" }}>{s.createdBy?.name || "—"}</td>
                                                {canManage && (
                                                    <td>
                                                        <div style={{ display: "flex", gap: 6 }}>
                                                            <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}>Edit</button>
                                                            {canDelete && <button className="btn btn-sm" style={{ background: "#fee2e2", color: "#dc2626", border: "none" }} onClick={() => handleDelete(s._id)}>Del</button>}
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
