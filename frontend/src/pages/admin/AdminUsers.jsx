import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, ShieldCheck, Trash2 } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/users')
            .then(r => setUsers(r.data))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    }, []);

    const makeAdmin = async (id) => {
        try {
            await axios.put(`/api/users/${id}`, { role: 'admin' });
            toast.success('User promoted to admin');
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role: 'admin' } : u));
        } catch { toast.error('Action failed'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await axios.delete(`/api/users/${id}`);
            toast.success('User deleted');
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">All Users</h2>
                <p className="text-sm text-slate-500 mt-1">{users.length} registered students</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                    <Users size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No users found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(u => (
                                <tr key={u._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                    <td className="px-4 py-4 text-slate-600">{u.email}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {u.role !== 'admin' && (
                                                <button onClick={() => makeAdmin(u._id)} className="p-1.5 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100" title="Make Admin">
                                                    <ShieldCheck size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
