import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ShoppingBag, Bell, MessageSquare } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-shrink-0 items-center">
                            <span className="text-2xl font-black text-primary-600 tracking-tight">CampusThrift</span>
                        </Link>
                        <div className="hidden md:ml-8 md:flex md:space-x-8">
                            <Link to="/marketplace" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-700 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600">
                                Marketplace
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!user ? (
                            <>
                                <Link to="/login" className="text-slate-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">Log in</Link>
                                <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">Sign up</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/dashboard/messages" className="text-slate-500 hover:text-primary-600 relative">
                                    <MessageSquare className="h-6 w-6" />
                                </Link>
                                <Link to="/dashboard/notifications" className="text-slate-500 hover:text-primary-600 relative">
                                    <Bell className="h-6 w-6" />
                                </Link>
                                <div className="relative flex items-center space-x-3 ml-4 border-l pl-4">
                                    <div className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</div>
                                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors" title="Logout">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
