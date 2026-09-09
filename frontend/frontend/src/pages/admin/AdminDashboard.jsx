import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Users, CreditCard, Activity, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        usersCount: 0,
        productsCount: 0,
        pendingProducts: [],
    });

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [usersRes, productsRes] = await Promise.all([
                    axios.get('/api/users'),
                    axios.get('/api/products?adminView=true'),
                ]);

                const allProducts = productsRes.data.products || [];
                const pending = allProducts.filter(p => p.approvalStatus === 'Pending');

                setStats({
                    usersCount: usersRes.data.length,
                    productsCount: allProducts.length,
                    pendingProducts: pending,
                });
            } catch (error) {
                toast.error('Failed to load admin stats');
            }
        };
        fetchAdminData();
    }, []);

    const handleApproval = async (productId, status) => {
        try {
            await axios.put(`/api/products/${productId}`, { approvalStatus: status });
            toast.success(`Product ${status}`);
            setStats(prev => ({
                ...prev,
                pendingProducts: prev.pendingProducts.filter(p => p._id !== productId)
            }));
        } catch (error) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Admin Overview</h2>
                <p className="mt-2 text-slate-600">Monitor and manage the Campus Thrift Store activity.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Users</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.usersCount}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Products</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.productsCount}</p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                        <Box size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingProducts.length}</p>
                    </div>
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                        <Activity size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Platform Status</p>
                        <p className="text-xl font-bold text-emerald-600 mt-2">Active</p>
                    </div>
                    <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>

            {/* Approval Queue */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">Product Approval Queue</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {stats.pendingProducts.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No products pending approval.</div>
                    ) : (
                        stats.pendingProducts.map(product => (
                            <div key={product._id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                        <img src={product.images[0]?.url} alt={product.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{product.title}</h4>
                                        <p className="text-sm text-slate-500 mt-1 lines-clamp-2">{product.description}</p>
                                        <div className="flex gap-4 mt-2">
                                            <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-1 rounded">Seller: {product.seller?.name || 'Unknown'}</span>
                                            <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-1 rounded">{product.listingType}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleApproval(product._id, 'Approved')}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium transition-colors"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleApproval(product._id, 'Rejected')}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-white border border-rose-600 text-rose-600 rounded-md hover:bg-rose-50 font-medium transition-colors"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
