import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
    const [otp, setOtp] = useState('');
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const devOtp = location.state?.devOtp || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('No email found in session.');
            return;
        }

        try {
            await verifyOtp(email, otp);
            toast.success('Account verified!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 border-b pb-4">
                        Verify OTP
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        We sent a 6-digit code to {email || 'your email'}.
                    </p>
                </div>

                {/* DEV MODE: Show OTP on screen since SMTP is not configured */}
                {devOtp && (
                    <div style={{ background: '#fef9c3', border: '2px dashed #ca8a04', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            🛠 Dev Mode — Email OTP
                        </p>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', letterSpacing: '0.3em' }}>{devOtp}</p>
                        <p style={{ fontSize: '11px', color: '#78716c', marginTop: '4px' }}>This box only appears in development.</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Enter OTP</label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-xl tracking-[0.5em] text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-3 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors cursor-pointer"
                        >
                            Verify Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
