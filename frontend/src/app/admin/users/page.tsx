"use client";

import { useEffect, useRef, useState } from "react";

interface ActiveUser {
  id: string;
  user_email: string;
  exness_account_id?: string;
  last_seen_at: string;
  role: string;
  status: string;
}

export default function UploadUsersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");
  const [manualFields, setManualFields] = useState({
    email: "",
    exness_account_id: "",
  });
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activeWindow, setActiveWindow] = useState(15);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    refreshActiveUsers();
    refreshAuthorizedUsers();
  }, []);

  const refreshActiveUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/active");
      if (!res.ok) return;
      const data = await res.json();
      setActiveUsers(data.activeUsers || []);
      setActiveWindow(data.windowMinutes || 15);
    } catch (err) {
      console.error("Active users error:", err);
    }
  };

  const refreshAuthorizedUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) return;
      const data = await res.json();
      setRecentUsers((data.users || []).slice(0, 6));
    } catch (err) {
      console.error("Authorized users error:", err);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");
    setManualSuccess("");
    if (!manualFields.email || !manualFields.exness_account_id) {
      setManualError("Email and Exness Account ID are required");
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(manualFields),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save user");
      }

      setManualSuccess("User saved");
      setManualFields({ email: "", exness_account_id: "" });
      refreshAuthorizedUsers();
    } catch (err: any) {
      console.error("Manual add error:", err);
      setManualError(err.message || "Failed to save user");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setSuccess("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-users", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(data.message);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      refreshAuthorizedUsers();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-400">Users</p>
        <h1 className="text-3xl font-bold text-white">Manage Access</h1>
        <p className="mt-1 text-slate-300">
          Add users manually, upload spreadsheets, and keep an eye on who is active.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              Add User Manually
            </h2>
            <p className="text-sm text-slate-400">
              Capture a single email + Exness Account ID without needing a spreadsheet.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            {manualError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {manualError}
              </div>
            )}

            {manualSuccess && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {manualSuccess}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={manualFields.email}
                onChange={(e) =>
                  setManualFields((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="trader@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Exness Account ID
              </label>
              <input
                type="text"
                value={manualFields.exness_account_id}
                onChange={(e) =>
                  setManualFields((prev) => ({
                    ...prev,
                    exness_account_id: e.target.value,
                  }))
                }
                placeholder="EXN123456"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 uppercase"
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3">
              Save User
            </button>
          </form>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              Upload Authorized Users
            </h2>
            <p className="text-sm text-slate-400">
              Import user emails and Exness Account IDs from an Excel sheet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Excel File (.xlsx or .xls)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-primary-500/15 file:text-primary-100 hover:file:bg-primary-500/25 cursor-pointer bg-slate-800/80 border border-slate-700 rounded-xl"
              />
              {file && (
                <p className="mt-2 text-sm text-slate-400">Selected: {file.name}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full btn-primary py-3 disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload Users"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Active users</h3>
              <p className="text-sm text-slate-400">
                Seen in the last {activeWindow} minutes
              </p>
            </div>
            <button
              onClick={refreshActiveUsers}
              className="text-xs text-primary-200 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {activeUsers.length === 0 ? (
            <p className="text-sm text-slate-400">
              No active users detected yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activeUsers.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {activity.user_email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {activity.exness_account_id || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-300">Online</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(activity.last_seen_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Recently added</h3>
              <p className="text-sm text-slate-400">
                Latest authorized users in the system
              </p>
            </div>
            <button
              onClick={refreshAuthorizedUsers}
              className="text-xs text-primary-200 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {user.exness_account_id}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
