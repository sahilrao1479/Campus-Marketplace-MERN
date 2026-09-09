import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    Available: 'bg-green-100 text-green-700',
    Sold: 'bg-slate-100 text-slate-500',
    Rented: 'bg-blue-100 text-blue-700',
    Unavailable: 'bg-red-100 text-red-600',
};

const APPROVAL_COLORS = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-600',
};

export default function MyListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = async () => {
        try {
            const { data } = await axios.get('/api/users/listings');
            setListings(data);
        } catch {
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchListings(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await axios.delete(`/api/products/${id}`);
            toast.success('Listing deleted');
            setListings(prev => prev.filter(l => l._id !== id));
        } catch {
            toast.error('Failed to delete listing');
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500">Loading your listings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage the items you've listed for sale or rent.</p>
                </div>
                <Link
                    to="/dashboard/add-product"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                    <PlusCircle size={18} /> Add New
                </Link>
            </div>

            {listings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No listings yet</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6">Start by listing something you no longer need.</p>
                    <Link to="/dashboard/add-product" className="btn-primary px-6 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                        List an Item
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-100">
                    {listings.map(item => (
                        <div key={item._id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                                {item.images?.[0]?.url
                                    ? <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-slate-400" /></div>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">{item.title}</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status] || 'bg-slate-100 text-slate-500'}`}>
                                        {item.status}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPROVAL_COLORS[item.approvalStatus] || 'bg-slate-100 text-slate-500'}`}>
                                        {item.approvalStatus}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                                        {item.listingType}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                {item.price > 0 && <p className="font-bold text-slate-900">₹{item.price}</p>}
                                {item.rentPrice > 0 && <p className="text-xs text-slate-500">Rent: ₹{item.rentPrice}/day</p>}
                            </div>
                            <button
                                onClick={() => handleDelete(item._id)}
                                className="ml-4 p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Delete listing"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
