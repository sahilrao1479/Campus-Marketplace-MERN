import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Trash2, Package } from 'lucide-react';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/products?adminView=true');
            setProducts(data.products || []);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleApproval = async (id, status) => {
        try {
            await axios.put(`/api/products/${id}`, { approvalStatus: status });
            toast.success(`Product ${status}`);
            setProducts(prev => prev.map(p => p._id === id ? { ...p, approvalStatus: status } : p));
        } catch { toast.error('Action failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            await axios.delete(`/api/products/${id}`);
            toast.success('Product deleted');
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch { toast.error('Delete failed'); }
    };

    const filtered = filter === 'All' ? products : products.filter(p => p.approvalStatus === filter);

    const statusColor = { Pending: 'bg-amber-100 text-amber-700', Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700' };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">All Products</h2>
                    <p className="text-sm text-slate-500 mt-1">{products.length} total listings</p>
                </div>
                <div className="flex gap-2">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                    <Package size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No {filter !== 'All' ? filter.toLowerCase() : ''} products found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Seller</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(p => (
                                    <tr key={p._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={p.images[0]?.url || 'https://via.placeholder.com/48'} alt={p.title} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                                <div>
                                                    <p className="font-medium text-slate-900">{p.title}</p>
                                                    <p className="text-xs text-slate-400">{p.category?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">{p.seller?.name || '—'}</td>
                                        <td className="px-4 py-4 font-semibold text-slate-900">₹{p.price || p.rentPrice}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor[p.approvalStatus]}`}>{p.approvalStatus}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.approvalStatus === 'Pending' && (<>
                                                    <button onClick={() => handleApproval(p._id, 'Approved')} className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100" title="Approve"><CheckCircle size={16} /></button>
                                                    <button onClick={() => handleApproval(p._id, 'Rejected')} className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100" title="Reject"><XCircle size={16} /></button>
                                                </>)}
                                                <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
