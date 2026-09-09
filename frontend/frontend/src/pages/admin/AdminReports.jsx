import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';

export default function AdminReports() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('/api/users'),
            axios.get('/api/products?adminView=true'),
        ]).then(([usersRes, productsRes]) => {
            const users = usersRes.data;
            const products = productsRes.data.products || [];
            const approved = products.filter(p => p.approvalStatus === 'Approved');
            const sold = products.filter(p => p.status === 'Sold');
            const totalRevenue = sold.reduce((acc, p) => acc + (p.price || 0), 0);

            setData({ users, products, approved, sold, totalRevenue });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    const cards = [
        { label: 'Total Users', value: data?.users.length || 0, icon: <Users size={22} />, color: 'text-blue-600 bg-blue-100' },
        { label: 'Total Listings', value: data?.products.length || 0, icon: <Package size={22} />, color: 'text-indigo-600 bg-indigo-100' },
        { label: 'Approved Listings', value: data?.approved.length || 0, icon: <ShoppingBag size={22} />, color: 'text-green-600 bg-green-100' },
        { label: 'Items Sold', value: data?.sold.length || 0, icon: <TrendingUp size={22} />, color: 'text-amber-600 bg-amber-100' },
        { label: 'Total Sale Value', value: `₹${data?.totalRevenue.toLocaleString('en-IN') || 0}`, icon: <BarChart3 size={22} />, color: 'text-purple-600 bg-purple-100' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Platform Reports</h2>
                <p className="text-sm text-slate-500 mt-1">Overview of Campus Thrift Store activity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(c => (
                    <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${c.color}`}>{c.icon}</div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{c.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-0.5">{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4">Category Breakdown</h3>
                {data?.products.length === 0 ? (
                    <p className="text-slate-400 text-sm">No products yet.</p>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(
                            (data?.products || []).reduce((acc, p) => {
                                const cat = p.category?.name || 'Uncategorized';
                                acc[cat] = (acc[cat] || 0) + 1;
                                return acc;
                            }, {})
                        ).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                            <div key={cat} className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 w-36 truncate">{cat}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-primary-500 h-2 rounded-full"
                                        style={{ width: `${(count / data.products.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 w-6 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
