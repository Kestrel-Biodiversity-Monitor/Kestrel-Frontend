"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";

const TABS = ["Profile", "Security", "Preferences"];

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const [tab, setTab] = useState(0);
    const [saving, setSaving] = useState(false);

    // Profile tab
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "", bio: user?.bio || "", organization: user?.organization || "", profileImage: "",
    });

    // Security tab
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    // Preferences tab
    const [upgradeReason, setUpgradeReason] = useState("");
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("name", profileForm.name);
            fd.append("bio", profileForm.bio);
            fd.append("organization", profileForm.organization);
            await api.put("/auth/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
            await refreshUser();
            toast.success("Profile saved successfully");
        } catch (err: any) { toast.error(err.response?.data?.message || "Save failed"); }
        finally { setSaving(false); }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords do not match");
        if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
        setSaving(true);
        try {
            await api.put("/auth/change-password", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success("Password changed successfully");
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) { toast.error(err.response?.data?.message || "Failed to change password"); }
        finally { setSaving(false); }
    };

    const handleRoleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!upgradeReason.trim()) return toast.error("Please provide a reason");
        setUpgradeLoading(true);
        try {
            await api.post("/auth/request-role-upgrade", { reason: upgradeReason });
            toast.success("Role upgrade request submitted");
            setUpgradeReason("");
        } catch (err: any) { toast.error(err.response?.data?.message || "Request failed"); }
        finally { setUpgradeLoading(false); }
    };

    if (!user) return null;
    const IMG_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";
    const initials = user.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

    return (
        <ProtectedRoute>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    <div className="topbar">
                        <div>
                            <div className="topbar-title">Settings</div>
                            <div className="topbar-subtitle">Manage your account, security, and preferences</div>
                        </div>
                    </div>

                    <div className="page-wrapper" style={{ maxWidth: 740 }}>
                        {/* User Card */}
                        <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, #0d2b1a 0%, #1a4731 100%)", color: "white" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#3d9a6a,#5cb887)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, border: "3px solid rgba(255,255,255,0.2)", flexShrink: 0, overflow: "hidden" }}>
                                    {user.profileImage ? <img src={`${IMG_URL}${user.profileImage}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>{user.name}</div>
                                    <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>{user.email}</div>
                                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                        <span className={`badge badge-${user.role}`}>{user.role}</span>
                                        <span style={{ fontSize: 12, opacity: 0.7 }}>🏆 {user.contributionScore} pts</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="tabs" style={{ marginBottom: 20 }}>
                            {TABS.map((t, i) => <button key={t} className={`tab-btn ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t}</button>)}
                        </div>

                        {/* Profile Tab */}
                        {tab === 0 && (
                            <div className="card">
                                <div className="card-header"><span className="card-title">Edit Profile</span></div>
                                <form onSubmit={handleProfileSave}>
                                    <div className="grid-2" style={{ marginBottom: 12 }}>
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Organization</label>
                                            <input className="form-input" value={profileForm.organization} onChange={e => setProfileForm(f => ({ ...f, organization: e.target.value }))} placeholder="Wildlife Foundation, Forest Dept..." />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bio</label>
                                        <textarea className="form-textarea" value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell the community about yourself, your research interests..." style={{ minHeight: 90 }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
                                </form>
                            </div>
                        )}

                        {/* Security Tab */}
                        {tab === 1 && (
                            <div className="card">
                                <div className="card-header"><span className="card-title">Change Password</span></div>
                                <form onSubmit={handlePasswordChange}>
                                    <div className="form-group">
                                        <label className="form-label">Current Password</label>
                                        <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Enter current password" autoComplete="current-password" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input className="form-input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="At least 6 characters" autoComplete="new-password" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input className="form-input" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat new password" autoComplete="new-password" />
                                    </div>
                                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", marginBottom: 16 }}>
                                        ⚠️ You will need to log in again after changing your password.
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Updating..." : "Update Password"}</button>
                                </form>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {tab === 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {/* Account Info */}
                                <div className="card">
                                    <div className="card-header"><span className="card-title">Account Information</span></div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {[
                                            { label: "Email", value: user.email },
                                            { label: "Role", value: user.role },
                                            { label: "Account Status", value: user.isActive ? "Active" : "Inactive" },
                                            { label: "Contribution Score", value: `${user.contributionScore} pts` },
                                            { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                                        ].map(item => (
                                            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                                                <span style={{ color: "#6b7280" }}>{item.label}</span>
                                                <span style={{ fontWeight: 600, color: "#111827" }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Role Upgrade */}
                                {user.role === "user" && (
                                    <div className="card">
                                        <div className="card-header">
                                            <span className="card-title">Request Officer Access</span>
                                            {user.roleUpgradeRequest && <span style={{ background: "#fef9c3", color: "#92400e", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>Pending</span>}
                                        </div>
                                        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, lineHeight: 1.6 }}>
                                            {user.roleUpgradeRequest
                                                ? "✅ Your request is under review by an admin."
                                                : "Officer access lets you submit detailed reports, manage alerts, and review anomalies."}
                                        </p>
                                        {!user.roleUpgradeRequest && (
                                            <form onSubmit={handleRoleRequest}>
                                                <div className="form-group">
                                                    <label className="form-label">Why do you need Officer access?</label>
                                                    <textarea className="form-textarea" required value={upgradeReason} onChange={e => setUpgradeReason(e.target.value)} placeholder="Describe your role, affiliation, and intended use..." style={{ minHeight: 90 }} />
                                                </div>
                                                <button type="submit" className="btn btn-secondary" disabled={upgradeLoading}>{upgradeLoading ? "Submitting..." : "Submit Request"}</button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
