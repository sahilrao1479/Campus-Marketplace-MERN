import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, Box, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <ShieldCheck className="h-6 w-6 text-primary-400 mr-2" />
                    <span className="text-xl font-bold">Admin Panel</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link to="/admin" className="flex items-center px-4 py-3 bg-slate-800 rounded-md text-slate-200">
                        <TrendingUp className="h-5 w-5 mr-3" /> Dashboard
                    </Link>
                    <Link to="/admin/products" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
                        <Box className="h-5 w-5 mr-3" /> Products
                    </Link>
                    <Link to="/admin/users" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
                        <Users className="h-5 w-5 mr-3" /> Users
                    </Link>
                    <Link to="/admin/reports" className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
                        <AlertCircle className="h-5 w-5 mr-3" /> Reports
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-red-900/50 rounded-md transition-colors">
                        <LogOut className="h-5 w-5 mr-3" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
