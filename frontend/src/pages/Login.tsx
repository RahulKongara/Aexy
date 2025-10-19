import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = isLogin ? await api.login(email, password) : await api.register(email, password);

            login(response.token, response.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed');
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
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
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