import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Campus Thrift Store. For Chitkara University Students.
                </div>
            </footer>
        </div>
    );
}
