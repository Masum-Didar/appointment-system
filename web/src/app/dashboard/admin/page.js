'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatDate, formatCurrency } from '@/lib/utils';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'assistants', label: 'Assistants' },
  { id: 'chambers', label: 'Chambers' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'payments', label: 'Payments' },
  { id: 'analytics', label: 'Analytics' },
];

export default function AdminDashboard() {
  return (
    <Suspense fallback={<Spinner className="py-20" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    if (activeTab === 'overview') fetchStats();
    else setLoading(false);
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await authFetch('/api/v1/admin/dashboard');
      const d = await res.json();
      setStats(d.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const setTab = (tab) => setActiveTab(tab);

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab stats={stats} />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'doctors' && <DoctorsTab />}
      {activeTab === 'assistants' && <AssistantsTab />}
      {activeTab === 'chambers' && <ChambersTab />}
      {activeTab === 'appointments' && <AppointmentsTab />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}

function OverviewTab({ stats }) {
  return (
    <>
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{stats?.users?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success-600">{stats?.doctors?.total || 0}</p>
          <p className="text-sm text-gray-500">Doctors</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning-600">{stats?.patients?.total || 0}</p>
          <p className="text-sm text-gray-500">Patients</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-danger-600">{stats?.unverifiedDoctors?.total || 0}</p>
          <p className="text-sm text-gray-500">Unverified Doctors</p>
        </Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-3">Appointments</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Today</span><span className="font-medium">{stats?.appointments?.today || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-medium text-success-600">{stats?.appointments?.completed || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cancelled</span><span className="font-medium text-danger-600">{stats?.appointments?.cancelled || 0}</span></div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-3">Revenue</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-medium">{formatCurrency(stats?.revenue?.total || 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Successful</span><span className="font-medium text-success-600">{stats?.revenue?.successfulTransactions || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Failed</span><span className="font-medium text-danger-600">{stats?.revenue?.failedTransactions || 0}</span></div>
          </div>
        </Card>
      </div>
    </>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('patient');

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/v1/admin/users?role=${role}&limit=100`);
      const d = await res.json();
      setUsers(d.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(roleFilter); }, [roleFilter]);

  const toggle = async (id, active) => {
    try {
      await authFetch(`/api/v1/admin/users/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active }),
      });
      setUsers(users.map(u => u.id === id ? { ...u, isActive: active } : u));
    } catch {}
  };

  const remove = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      const res = await authFetch(`/api/v1/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) setUsers(users.filter(u => u.id !== id));
    } catch {}
  };

  return (
    <div>
      <div className="mb-4">
        <select className="input-field w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="patient">Patient</option>
          <option value="assistant">Assistant</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {loading ? <Spinner /> : (
      <div className="overflow-x-auto">
        {users.length === 0 ? <p className="text-center py-10 text-gray-500">No users found.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-3">Name</th><th className="pb-3">Phone</th><th className="pb-3">Role</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 font-medium">
                  {u.role === 'doctor' ? (
                    <Link href={`/admin/doctors/${u.profile?.id}`} className="text-primary-600 hover:underline">{u.profile?.name || u.phone}</Link>
                  ) : u.role === 'assistant' ? (
                    <Link href={`/admin/assistants/${u.id}`} className="text-primary-600 hover:underline">{u.profile?.name || u.phone}</Link>
                  ) : (
                    u.profile?.name || u.phone
                  )}
                </td>
                <td className="py-3">{u.phone}</td>
                <td className="py-3"><Badge status={u.role} /></td>
                <td className="py-3"><Badge status={u.isActive ? 'active' : 'inactive'} /></td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => toggle(u.id, !u.isActive)} className="text-primary-600 hover:underline text-sm">{u.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => remove(u.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      )}
    </div>
  );
}

function DoctorsTab() {
  const [doctors, setDoctors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignId, setAssignId] = useState(null);
  const [selectedAssistant, setSelectedAssistant] = useState('');

  useEffect(() => {
    Promise.all([
      authFetch('/api/v1/admin/doctors?limit=100').then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); }),
      authFetch('/api/v1/admin/users?role=assistant&limit=100').then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); }),
    ]).then(([d, a]) => {
      setDoctors(d.data || []);
      setAssistants((a.data || []).filter(u => u.role === 'assistant'));
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const verify = async (id, val) => {
    try {
      await authFetch(`/api/v1/admin/doctors/${id}/verify`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: val }),
      });
      setDoctors(doctors.map(d => d.id === id ? { ...d, isVerified: val } : d));
    } catch {}
  };

  const assign = async (doctorId) => {
    if (!selectedAssistant) return;
    try {
      await authFetch(`/api/v1/admin/doctors/${doctorId}/assign-assistant`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantUserId: selectedAssistant }),
      });
      setAssignId(null);
      setSelectedAssistant('');
    } catch {}
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-center py-10 text-red-500">Error: {error}</p>;
  if (doctors.length === 0) return <p className="text-center py-10 text-gray-500">No doctors found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b"><th className="pb-3">Name</th><th className="pb-3">Speciality</th><th className="pb-3">Fee</th><th className="pb-3">Verified</th><th className="pb-3">Actions</th></tr></thead>
        <tbody>
          {doctors.map(d => (
            <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-medium"><Link href={`/admin/doctors/${d.id}`} className="text-primary-600 hover:underline">{d.name}</Link></td>
              <td className="py-3">{d.speciality}</td>
              <td className="py-3">{d.consultationFee ? formatCurrency(d.consultationFee) : '---'}</td>
              <td className="py-3"><Badge status={d.isVerified ? 'verified' : 'pending'} /></td>
              <td className="py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {!d.isVerified && <button onClick={() => verify(d.id, true)} className="btn-primary text-xs py-1 px-3">Verify</button>}
                  <button onClick={() => verify(d.id, false)} className="btn-danger text-xs py-1 px-3">Reject</button>
                  {assignId === d.id ? (
                    <div className="flex items-center gap-1">
                      <select className="input-field text-xs py-1 w-auto" value={selectedAssistant} onChange={e => setSelectedAssistant(e.target.value)}>
                        <option value="">Select...</option>
                        {assistants.map(a => <option key={a.id} value={a.id}>{a.profile?.name || a.phone}</option>)}
                      </select>
                      <button onClick={() => assign(d.id)} className="btn-primary text-xs py-1 px-2">Assign</button>
                      <button onClick={() => setAssignId(null)} className="text-xs text-gray-500">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setAssignId(d.id)} className="text-primary-600 hover:underline text-xs">Assign Assistant</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssistantsTab() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/v1/admin/assistants?limit=100')
      .then(r => r.json()).then(d => setAssistants(d.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{assistants.length} assistant(s)</p>
        <Link href="/admin/assistants"><button className="btn-primary text-sm py-1.5 px-3">Manage Assistants</button></Link>
      </div>
      <div className="overflow-x-auto">
        {assistants.length === 0 ? <p className="text-center py-10 text-gray-500">No assistants found.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-3">Name</th><th className="pb-3">Phone</th><th className="pb-3">Chamber</th><th className="pb-3">Doctor</th><th className="pb-3">Status</th></tr></thead>
          <tbody>
            {assistants.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 font-medium"><Link href={`/admin/assistants/${a.userId}`} className="text-primary-600 hover:underline">{a.name}</Link></td>
                <td className="py-3">{a.phone || '---'}</td>
                <td className="py-3">{a.chamber?.name || '---'}</td>
                <td className="py-3">{a.doctor ? <Link href={`/admin/doctors/${a.doctor.id}`} className="text-primary-600 hover:underline">{a.doctor.name}</Link> : '---'}</td>
                <td className="py-3"><Badge status={a.isActive ? 'active' : 'inactive'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

function ChambersTab() {
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeEditId, setFeeEditId] = useState(null);
  const [feeForm, setFeeForm] = useState({ consultationFee: '', followUpFee: '' });

  useEffect(() => {
    authFetch('/api/v1/admin/chambers?limit=100')
      .then(r => r.json()).then(d => setChambers(d.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = async (id, active) => {
    try {
      await authFetch(`/api/v1/admin/chambers/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active }),
      });
      setChambers(chambers.map(c => c.id === id ? { ...c, isActive: active } : c));
    } catch {}
  };

  const updateFee = async (id) => {
    const body = {};
    if (feeForm.consultationFee !== '') body.consultationFee = parseFloat(feeForm.consultationFee);
    if (feeForm.followUpFee !== '') body.followUpFee = parseFloat(feeForm.followUpFee);
    try {
      await authFetch(`/api/v1/admin/chambers/${id}/fees`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setFeeEditId(null);
      setFeeForm({ consultationFee: '', followUpFee: '' });
    } catch {}
  };

  if (loading) return <Spinner />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b"><th className="pb-3">Name</th><th className="pb-3">Doctor</th><th className="pb-3">Location</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead>
        <tbody>
          {chambers.map(c => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-medium">{c.name}</td>
              <td className="py-3">{c.doctor?.name || 'N/A'}</td>
              <td className="py-3 text-sm">{c.address}, {c.city}</td>
              <td className="py-3"><Badge status={c.isActive ? 'active' : 'inactive'} /></td>
              <td className="py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => toggle(c.id, !c.isActive)} className="text-primary-600 hover:underline text-sm">{c.isActive ? 'Deactivate' : 'Activate'}</button>
                  {feeEditId === c.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" className="input-field text-xs py-1 w-20" placeholder="Fee" value={feeForm.consultationFee} onChange={e => setFeeForm({ ...feeForm, consultationFee: e.target.value })} />
                      <input type="number" className="input-field text-xs py-1 w-20" placeholder="Follow-up" value={feeForm.followUpFee} onChange={e => setFeeForm({ ...feeForm, followUpFee: e.target.value })} />
                      <button onClick={() => updateFee(c.id)} className="btn-primary text-xs py-1 px-2">Save</button>
                      <button onClick={() => setFeeEditId(null)} className="text-xs text-gray-500">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setFeeEditId(c.id); setFeeForm({ consultationFee: '', followUpFee: '' }); }} className="text-primary-600 hover:underline text-sm">Set Fees</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentsTab() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (filter) params.set('status', filter);
    authFetch(`/api/v1/admin/appointments?${params}`)
      .then(r => r.json()).then(d => { setData(d.data || []); setMeta(d.meta || null); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, filter]);

  return (
    <div className="space-y-4">
      <select className="input-field w-auto" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="checked_in">Checked In</option>
        <option value="in_consultation">In Consultation</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="missed">Missed</option>
      </select>
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b"><th className="pb-3">Token</th><th className="pb-3">Patient</th><th className="pb-3">Doctor</th><th className="pb-3">Date</th><th className="pb-3">Type</th><th className="pb-3">Fee</th><th className="pb-3">Status</th></tr></thead>
            <tbody>
              {data.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-500">No appointments.</td></tr> : data.map(a => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono">{a.tokenNumber || a.serialNumber || '---'}</td>
                  <td className="py-3">{a.patient?.name || 'N/A'}</td>
                  <td className="py-3">{a.doctor?.name || 'N/A'}</td>
                  <td className="py-3">{a.appointmentDate ? formatDate(a.appointmentDate) : '---'}</td>
                  <td className="py-3 capitalize">{a.type || '---'}</td>
                  <td className="py-3">{a.consultationFee ? formatCurrency(a.consultationFee) : '---'}</td>
                  <td className="py-3"><Badge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-sm">Prev</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {meta.page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="btn-secondary text-sm">Next</button>
        </div>
      )}
    </div>
  );
}

function PaymentsTab() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (filter) params.set('status', filter);
    authFetch(`/api/v1/admin/payments?${params}`)
      .then(r => r.json()).then(d => { setData(d.data || []); setMeta(d.meta || null); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, filter]);

  return (
    <div className="space-y-4">
      {meta?.summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border text-center"><p className="text-2xl font-bold text-primary-600">{formatCurrency(meta.summary.totalRevenue)}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
          <div className="bg-white p-4 rounded-xl border text-center"><p className="text-2xl font-bold text-success-600">{meta.summary.successful}</p><p className="text-xs text-gray-500">Successful</p></div>
          <div className="bg-white p-4 rounded-xl border text-center"><p className="text-2xl font-bold text-danger-600">{meta.summary.failed}</p><p className="text-xs text-gray-500">Failed</p></div>
        </div>
      )}
      <select className="input-field w-auto" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
        <option value="">All Status</option>
        <option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
      </select>
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b"><th className="pb-3">Token</th><th className="pb-3">Patient</th><th className="pb-3">Amount</th><th className="pb-3">Method</th><th className="pb-3">Date</th><th className="pb-3">Status</th></tr></thead>
            <tbody>
              {data.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-gray-500">No payments.</td></tr> : data.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono">{p.tokenNumber || '---'}</td>
                  <td className="py-3">{p.patient?.name || 'N/A'}</td>
                  <td className="py-3 font-medium">{p.amount ? formatCurrency(p.amount) : '---'}</td>
                  <td className="py-3 capitalize">{p.paymentMethod || '---'}</td>
                  <td className="py-3">{p.createdAt ? formatDate(p.createdAt) : '---'}</td>
                  <td className="py-3"><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-sm">Prev</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {meta.page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="btn-secondary text-sm">Next</button>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    authFetch(`/api/v1/admin/analytics?dateFrom=${from}&dateTo=${to}&groupBy=day`)
      .then(r => r.json()).then(d => setData(d.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-gray-500 text-center py-10">No analytics available.</p>;

  return (
    <div className="space-y-6">
      {data.appointmentTrends?.length > 0 && (
        <Card><h2 className="text-lg font-semibold mb-3">Appointment Trends (Last 30 Days)</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {data.appointmentTrends.slice(-10).map((t, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="text-gray-600">{t.period ? new Date(t.period).toLocaleDateString() : 'N/A'}</span><span>{t.total} ({t.completed} completed)</span></div>
            ))}
          </div>
        </Card>
      )}
      {data.topDoctors?.length > 0 && (
        <Card><h2 className="text-lg font-semibold mb-3">Top Doctors</h2>
          <div className="space-y-2">
            {data.topDoctors.slice(0, 5).map((d, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="font-medium">{d.name}</span><span className="text-gray-500">{d.completed} appointments | ⭐ {d.avgRating || 'N/A'}</span></div>
            ))}
          </div>
        </Card>
      )}
      {data.specialityBreakdown?.length > 0 && (
        <Card><h2 className="text-lg font-semibold mb-3">Speciality Breakdown</h2>
          <div className="space-y-2">
            {data.specialityBreakdown.map((s, i) => (
              <div key={i} className="flex justify-between text-sm"><span className="font-medium">{s.speciality}</span><span className="text-gray-500">{s.doctorCount} doctors | {s.completed} completed</span></div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
