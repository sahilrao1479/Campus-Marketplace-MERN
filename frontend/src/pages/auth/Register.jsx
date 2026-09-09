import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await register(name, email, password);
            toast.success(resp.message || 'OTP sent to email');
            navigate('/verify-otp', { state: { email, devOtp: resp.devOtp } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 border-b pb-4">
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        For Chitkara University Students Only
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Chitkara Email</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="name@chitkara.edu.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                                placeholder="Min 8 chars, 1 Uppercase, 1 Num, 1 Spec"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-3 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors cursor-pointer"
                        >
                            Sign up
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-slate-600">Already have an account? </span>
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Login here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
