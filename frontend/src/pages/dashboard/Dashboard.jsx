import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, Heart, CreditCard, MessageSquare } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/api/users/profile');
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-primary-900 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold sm:text-4xl">Hello, {user.name.split(' ')[0]}!</h1>
                    <p className="mt-2 text-primary-100 text-lg">Welcome back to your Campus Thrift Dashboard.</p>
                    {user.role === 'admin' && (
                        <Link to="/admin" className="mt-6 inline-block bg-white text-primary-900 px-6 py-2 rounded-full font-semibold hover:bg-slate-50 transition-colors">
                            Go to Admin Panel
                        </Link>
                    )}
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
                    <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" /></svg>
                </div>
            </div>

            {/* Quick Links */}
            <h2 className="text-2xl font-bold text-slate-900">Your Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/dashboard/listings" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <Package size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">My Listings</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage active items</p>
                </Link>
                <Link to="/dashboard/purchases" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                        <CreditCard size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Purchases & Rentals</h3>
                    <p className="text-sm text-slate-500 mt-1">View transaction history</p>
                </Link>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="bg-rose-50 w-12 h-12 rounded-full flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                        <Heart size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Wishlist</h3>
                    <p className="text-sm text-slate-500 mt-1">{profile?.wishlist?.length || 0} saved items</p>
                </div>
                <Link to="/dashboard/messages" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                        <MessageSquare size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Messages</h3>
                    <p className="text-sm text-slate-500 mt-1">Chat securely</p>
                </Link>
            </div>

            {/* Account Info */}
            <h2 className="text-2xl font-bold text-slate-900 pt-4">Account Details</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{profile?.name}</h3>
                    <p className="text-slate-500">{profile?.email}</p>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 mt-2 border border-green-200">
                        Verified Chitkara Student
                    </span>
                </div>
            </div>
        </div>
    );
}
