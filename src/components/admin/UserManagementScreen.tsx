import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Pencil, Trash2, X, Check, Loader2, Link2, Link2Off, ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/apiClient';
import { useAuth } from '@/src/context/AuthContext';
import { LogIn } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'rsm' | 'rep' | 'sdr';
  territory: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface Assignment {
  id: string;
  sdr_id: string;
  rep_id: string;
  rep_name: string;
  rep_email: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  rsm: 'RSM',
  rep: 'Rep',
  sdr: 'SDR',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  rsm: 'bg-violet-100 text-violet-700',
  rep: 'bg-blue-100 text-blue-700',
  sdr: 'bg-cyan-100 text-cyan-700',
};

// ─── Inline modal shell ────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
}

const NEW_TERRITORY = '__new__';

function TerritoryField({
  value, onChange, territories,
}: {
  value: string;
  onChange: (v: string) => void;
  territories: string[];
}) {
  const isCustom = value !== '' && !territories.includes(value);
  const [showCustom, setShowCustom] = React.useState(isCustom);

  const handleSelect = (v: string) => {
    if (v === NEW_TERRITORY) {
      setShowCustom(true);
      onChange('');
    } else {
      setShowCustom(false);
      onChange(v);
    }
  };

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label mb-1">
        Territory (optional)
      </label>
      <select
        value={showCustom ? NEW_TERRITORY : (value || '')}
        onChange={e => handleSelect(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
      >
        <option value="">— None —</option>
        {territories.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
        <option value={NEW_TERRITORY}>+ New territory…</option>
      </select>
      {showCustom && (
        <input
          autoFocus
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. West Enterprise"
          className="mt-2 w-full px-3 py-2 rounded-lg border border-cyan-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserManagementScreen() {
  const { user: me, loginAs } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [expandedSdr, setExpandedSdr] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});
  const [territories, setTerritories] = useState<string[]>([]);

  // Create form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('rep');
  const [newTerritory, setNewTerritory] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadUsers = async () => {
    try {
      const data = await api.get<UserRecord[]>('/api/users');
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    api.get<{ id: string; name: string }[]>('/api/territories')
      .then(ts => setTerritories(ts.map(t => t.name)))
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/api/users', {
        email: newEmail,
        password: newPassword,
        full_name: newName,
        role: newRole,
        territory: newTerritory || null,
      });
      setShowCreate(false);
      setNewEmail(''); setNewName(''); setNewRole('rep'); setNewTerritory(''); setNewPassword('');
      await loadUsers();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setFormError('');
    setSaving(true);
    try {
      await api.patch(`/api/users/${editUser.id}`, {
        full_name: editUser.full_name,
        role: editUser.role,
        territory: editUser.territory,
        is_active: editUser.is_active,
      });
      setEditUser(null);
      await loadUsers();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/users/${userId}`);
      await loadUsers();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const loadAssignments = async (sdrId: string) => {
    if (assignments[sdrId]) return;
    try {
      const data = await api.get<Assignment[]>(`/api/users/${sdrId}/assignments`);
      setAssignments(prev => ({ ...prev, [sdrId]: data }));
    } catch {
      setAssignments(prev => ({ ...prev, [sdrId]: [] }));
    }
  };

  const toggleSdr = async (sdrId: string) => {
    if (expandedSdr === sdrId) { setExpandedSdr(null); return; }
    setExpandedSdr(sdrId);
    await loadAssignments(sdrId);
  };

  const addAssignment = async (sdrId: string, repId: string) => {
    try {
      const data = await api.post<Assignment>(`/api/users/${sdrId}/assignments`, { rep_id: repId });
      setAssignments(prev => ({ ...prev, [sdrId]: [...(prev[sdrId] ?? []), data] }));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to add assignment');
    }
  };

  const removeAssignment = async (sdrId: string, repId: string) => {
    try {
      await api.delete(`/api/users/${sdrId}/assignments/${repId}`);
      setAssignments(prev => ({
        ...prev,
        [sdrId]: (prev[sdrId] ?? []).filter(a => a.rep_id !== repId),
      }));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to remove');
    }
  };

  const reps = users.filter(u => u.role === 'rep');
  const isAdmin = me?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Users size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-black font-headline text-slate-900">User Management</h1>
            <p className="text-[11px] text-slate-500 font-label">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white text-sm font-bold rounded-xl hover:bg-cyan-700 transition-colors"
          >
            <Plus size={15} />
            Add User
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label">Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label">Email</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label">Role</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label">Territory</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label">Status</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <React.Fragment key={u.id}>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.full_name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold font-label uppercase', ROLE_COLORS[u.role])}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.territory ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold font-label', u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400')}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {u.role === 'sdr' && (
                            <button
                              onClick={() => toggleSdr(u.id)}
                              title="Manage rep assignments"
                              className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            >
                              {expandedSdr === u.id ? <ChevronUp size={14} /> : <Link2 size={14} />}
                            </button>
                          )}
                          {me?.role === 'admin' && u.id !== me?.id && (
                            <button
                              onClick={() => loginAs(u.id)}
                              title={`Login as ${u.full_name}`}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <LogIn size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => { setEditUser({ ...u }); setFormError(''); }}
                            className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          {u.id !== me?.id && (
                            <button
                              onClick={() => handleDelete(u.id, u.full_name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* SDR Assignment row */}
                  {expandedSdr === u.id && u.role === 'sdr' && (
                    <tr key={`${u.id}-assignments`} className="bg-violet-50/40">
                      <td colSpan={6} className="px-6 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 font-label mb-3">
                          Assigned Reps for {u.full_name}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(assignments[u.id] ?? []).map(a => (
                            <div key={a.rep_id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-violet-200 text-sm text-slate-700">
                              {a.rep_name}
                              <button
                                onClick={() => removeAssignment(u.id, a.rep_id)}
                                className="text-slate-300 hover:text-red-500"
                              >
                                <Link2Off size={12} />
                              </button>
                            </div>
                          ))}
                          {(assignments[u.id] ?? []).length === 0 && (
                            <p className="text-xs text-slate-400">No reps assigned yet.</p>
                          )}
                        </div>
                        {reps.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-label">Add rep:</span>
                            <select
                              className="text-sm px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
                              defaultValue=""
                              onChange={e => {
                                if (e.target.value) addAssignment(u.id, e.target.value);
                                e.target.value = '';
                              }}
                            >
                              <option value="" disabled>Select rep…</option>
                              {reps
                                .filter(r => !(assignments[u.id] ?? []).some(a => a.rep_id === r.id))
                                .map(r => (
                                  <option key={r.id} value={r.id}>{r.full_name}</option>
                                ))
                              }
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add New User" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Full Name" value={newName} onChange={setNewName} placeholder="Jane Smith" />
            <Field label="Email" value={newEmail} onChange={setNewEmail} type="email" placeholder="jane@netskope.com" />
            <Field label="Password" value={newPassword} onChange={setNewPassword} type="password" placeholder="Temporary password" />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label mb-1">Role</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="admin">Admin</option>
                <option value="rsm">RSM</option>
                <option value="rep">Rep</option>
                <option value="sdr">SDR</option>
              </select>
            </div>
            <TerritoryField value={newTerritory} onChange={setNewTerritory} territories={territories} />
            {formError && <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Field
              label="Full Name"
              value={editUser.full_name}
              onChange={v => setEditUser(prev => prev ? { ...prev, full_name: v } : null)}
            />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-label mb-1">Role</label>
              <select
                value={editUser.role}
                onChange={e => setEditUser(prev => prev ? { ...prev, role: e.target.value as UserRecord['role'] } : null)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="admin">Admin</option>
                <option value="rsm">RSM</option>
                <option value="rep">Rep</option>
                <option value="sdr">SDR</option>
              </select>
            </div>
            <TerritoryField
              value={editUser.territory ?? ''}
              onChange={v => setEditUser(prev => prev ? { ...prev, territory: v || null } : null)}
              territories={territories}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={editUser.is_active}
                onChange={e => setEditUser(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                className="w-4 h-4 rounded accent-cyan-600"
              />
              <label htmlFor="is_active" className="text-sm text-slate-700">Active account</label>
            </div>
            {formError && <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
