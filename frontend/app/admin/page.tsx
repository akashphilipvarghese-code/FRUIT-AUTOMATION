"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminView() {
  const [users, setUsers] = useState<Array<{ id: number; email: string; name: string; role: string }>>([]);
  const [logs, setLogs] = useState<Array<{ id: number; model: string; confidence: number; time_ms: number }>>([]);
  const [scans, setScans] = useState<Array<{ id: number; scan_type: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [uRes, lRes, sRes] = await Promise.all([
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/confidence-logs?limit=50`),
          axios.get(`${API_URL}/scan-history?limit=20`),
        ]);
        setUsers(uRes.data);
        setLogs(lRes.data);
        setScans(sRes.data);
      } catch {
        setUsers([]);
        setLogs([]);
        setScans([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Admin View</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Management</h2>
          {users.length === 0 ? (
            <p className="text-slate-500">No users yet. Add via API or seed.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Model Confidence Logs</h2>
          {logs.length === 0 ? (
            <p className="text-slate-500">No logs yet. Run an analysis first.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Model</th>
                    <th className="text-right py-2">Confidence</th>
                    <th className="text-right py-2">Time (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 20).map((l) => (
                    <tr key={l.id} className="border-b">
                      <td className="py-2">{l.model}</td>
                      <td className="py-2 text-right">{l.confidence?.toFixed(3)}</td>
                      <td className="py-2 text-right">{l.time_ms?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Scan History</h2>
        {scans.length === 0 ? (
          <p className="text-slate-500">No scans yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2">{s.id}</td>
                  <td className="py-2">{s.scan_type}</td>
                  <td className="py-2">{s.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
