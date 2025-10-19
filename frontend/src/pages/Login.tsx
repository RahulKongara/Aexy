import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Client-side validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = isLogin ? await api.login(email, password) : await api.register(email, password);

            if (!isLogin) {
                setSuccess('Account created successfully! Redirecting...');
            }

            login(response.token, response.user);
            setTimeout(() => navigate('/dashboard'), isLogin ? 0 : 1000);
        } catch (err: any) {
            // Extract error message from response
            const errorMessage = err.response?.data?.error || 'Authentication failed. Please try again.';
            setError(errorMessage);
            console.error('Auth error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#001219] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="bg-[#94d2bd] rounded-lg p-6 sm:p-8 w-full max-w-md shadow-2xl shadow-amber-50">
                <h1 className="text-3xl sm:text-4xl font-bold text-center pt-2 mb-2">Aexy</h1>
                <p className="text-sm sm:text-base text-gray-600 text-center mb-6">AI Conversation Practice</p>

                <form onSubmit={handleSubmit} className="space-y-4 form-style">
                    <div>
                        <label className="block text-sm font-medium login-margin-bot">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#669bbc]" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium login-margin-bot">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#669bbc]" required />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">⚠️</span>
                            <span className="flex-1">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded-lg text-sm flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">✓</span>
                            <span className="flex-1">{success}</span>
                        </div>
                    )}


                    <button type="submit" disabled={loading} className="login-btn w-full px-4 py-2 bg-[#669bbc] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium">
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-800 hover:underline text-sm">
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t flex flex-col justify-center items-center">
                    <p className="text-xs text-gray-500 text-center mb-2">Test accounts:</p>
                    <p className="text-xs text-gray-600">free@test.com (Free tier)</p>
                    <p className="text-xs text-gray-600">standard@test.com (Standard tier)</p>
                    <p className="text-xs text-gray-600">premium@test.com (Premium tier)</p>
                    <p className="text-xs text-gray-600 mt-1">Password: password123</p>
                </div>
            </div>
        </div>
    );
};