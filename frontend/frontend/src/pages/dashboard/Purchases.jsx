import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Purchases() {
    const [orders, setOrders] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('purchases');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, rentalsRes] = await Promise.all([
                    axios.get('/api/users/purchases'),
                    axios.get('/api/users/rentals'),
                ]);
                setOrders(ordersRes.data);
                setRentals(rentalsRes.data);
            } catch {
                toast.error('Failed to load transaction history');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center py-20 text-slate-500">Loading history...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Purchases & Rentals</h1>
                <p className="text-slate-500 text-sm mt-1">Your complete transaction history.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setTab('purchases')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'purchases' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Purchases ({orders.length})
                </button>
                <button
                    onClick={() => setTab('rentals')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'rentals' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Rentals ({rentals.length})
                </button>
            </div>

            {tab === 'purchases' && (
                orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                        <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">No purchases yet</h3>
                        <p className="text-slate-500 text-sm mt-1">Items you buy will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-100">
                        {orders.map(order => (
                            <div key={order._id} className="flex items-center gap-4 p-5">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                    {order.product?.images?.[0]?.url
                                        ? <img src={order.product.images[0].url} alt={order.product.title} className="w-full h-full object-cover" />
                                        : <CreditCard size={24} className="m-auto text-slate-300" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{order.product?.title || 'Product'}</p>
                                    <p className="text-xs text-slate-500">Seller: {order.seller?.name || 'N/A'}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">₹{order.amount}</p>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {tab === 'rentals' && (
                rentals.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                        <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">No rentals yet</h3>
                        <p className="text-slate-500 text-sm mt-1">Items you rent will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-100">
                        {rentals.map(rental => (
                            <div key={rental._id} className="flex items-center gap-4 p-5">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                    {rental.product?.images?.[0]?.url
                                        ? <img src={rental.product.images[0].url} alt={rental.product.title} className="w-full h-full object-cover" />
                                        : <CreditCard size={24} className="m-auto text-slate-300" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{rental.product?.title || 'Product'}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(rental.startDate).toLocaleDateString('en-IN')} → {new Date(rental.endDate).toLocaleDateString('en-IN')}
                                    </p>
                                    <p className="text-xs text-slate-400">Owner: {rental.owner?.name || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">₹{rental.amount}</p>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{rental.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
