"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

interface Report {
    _id: string; speciesName?: string; riskLevel: string;
    location: { coordinates: [number, number]; regionName?: string };
    habitatType: string; observationType: string; createdAt: string;
}

const riskColor: Record<string, string> = {
    Low: "#16a34a", Medium: "#ca8a04", High: "#ea580c", Critical: "#dc2626",
};

export default function MapPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [filtered, setFiltered] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [riskFilter, setRiskFilter] = useState("");
    const [selected, setSelected] = useState<Report | null>(null);

    useEffect(() => {
        api.get("/reports?limit=200")
            .then(r => { setReports(r.data.reports); setFiltered(r.data.reports); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setFiltered(riskFilter ? reports.filter(r => r.riskLevel === riskFilter) : reports);
    }, [riskFilter, reports]);

    // Simple SVG map mock — in real deployment, integrate Leaflet here
    const bounds = { minLng: 68, maxLng: 97, minLat: 8, maxLat: 37 };
    const toX = (lng: number) => ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const toY = (lat: number) => (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;

    return (
        <ProtectedRoute>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    <div className="topbar">
                        <div>
                            <div className="topbar-title">Sightings Map</div>
                            <div className="topbar-subtitle">Geospatial view of all species observations across India</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <select className="form-select" value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px" }}>
                                <option value="">All Risk Levels</option>
                                {["Low", "Medium", "High", "Critical"].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <span style={{ fontSize: 13, color: "#6b7280" }}>{filtered.length} sightings</span>
                        </div>
                    </div>

                    <div className="page-wrapper">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
                            {/* Map Canvas */}
                            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                                <div style={{ position: "relative", width: "100%", paddingBottom: "60%", background: "linear-gradient(145deg, #e8f5ee 0%, #d1fae5 40%, #a7f3d0 100%)" }}>
                                    {loading ? (
                                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <div className="spinner" style={{ borderColor: "rgba(26,71,49,0.3)", borderTopColor: "#1a4731", width: 36, height: 36 }} />
                                        </div>
                                    ) : (
                                        <svg viewBox="0 0 100 60" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
                                            {/* India outline placeholder */}
                                            <rect width="100" height="60" fill="none" />
                                            <text x="50" y="5" textAnchor="middle" fontSize="3" fill="#9ca3af" fontFamily="sans-serif">India — Species Sightings Map</text>
                                            {filtered.map(r => {
                                                const [lng, lat] = r.location.coordinates;
                                                const x = toX(lng); const y = toY(lat);
                                                if (x < 0 || x > 100 || y < 0 || y > 100) return null;
                                                return (
                                                    <g key={r._id} onClick={() => setSelected(r)} style={{ cursor: "pointer" }}>
                                                        <circle cx={x} cy={y} r="1.2" fill={riskColor[r.riskLevel] || "#6b7280"} opacity="0.85"
                                                            stroke="white" strokeWidth="0.3" />
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    )}
                                </div>
                                {/* Legend */}
                                <div style={{ padding: "12px 20px", display: "flex", gap: 20, flexWrap: "wrap", borderTop: "1px solid #f3f4f6" }}>
                                    {Object.entries(riskColor).map(([level, color]) => (
                                        <div key={level} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" }}>
                                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
                                            {level}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Side Panel */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {/* Stats */}
                                <div className="card">
                                    <div className="card-title" style={{ marginBottom: 12 }}>Summary</div>
                                    {["Low", "Medium", "High", "Critical"].map(level => {
                                        const count = filtered.filter(r => r.riskLevel === level).length;
                                        return (
                                            <div key={level} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: riskColor[level] }} />
                                                    <span style={{ fontSize: 13 }}>{level}</span>
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 14, color: riskColor[level] }}>{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Selected sighting */}
                                {selected && (
                                    <div className="card">
                                        <div className="card-header" style={{ marginBottom: 10 }}>
                                            <span className="card-title">Selected Sighting</span>
                                            <button className="btn btn-sm btn-ghost" onClick={() => setSelected(null)}>✕</button>
                                        </div>
                                        <div style={{ fontSize: 13 }}>
                                            <div style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selected.speciesName || "Unknown Species"}</div>
                                            <div style={{ color: "#6b7280", marginBottom: 4 }}>📍 {selected.location.regionName || `${selected.location.coordinates[1].toFixed(2)}°N, ${selected.location.coordinates[0].toFixed(2)}°E`}</div>
                                            <div style={{ color: "#6b7280", marginBottom: 4 }}>🌿 {selected.habitatType}</div>
                                            <div style={{ color: "#6b7280", marginBottom: 8 }}>👁 {selected.observationType}</div>
                                            <span style={{ background: `${riskColor[selected.riskLevel]}18`, color: riskColor[selected.riskLevel], borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${riskColor[selected.riskLevel]}40` }}>{selected.riskLevel} Risk</span>
                                        </div>
                                    </div>
                                )}

                                {/* Recent sightings list */}
                                <div className="card" style={{ flex: 1, overflow: "auto" }}>
                                    <div className="card-title" style={{ marginBottom: 10 }}>Recent Sightings</div>
                                    {filtered.slice(0, 15).map(r => (
                                        <div key={r._id} onClick={() => setSelected(r)} style={{ padding: "8px 4px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{r.speciesName || "Unknown"}</div>
                                                <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.location.regionName || "—"}</div>
                                            </div>
                                            <span style={{ background: `${riskColor[r.riskLevel]}18`, color: riskColor[r.riskLevel], borderRadius: 999, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>{r.riskLevel}</span>
                                        </div>
                                    ))}
                                    {filtered.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No sightings to display</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
