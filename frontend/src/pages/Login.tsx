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
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2">Aexy</h1>
                <p className="text-gray-600 text-center mb-6">AI Conversation Practice</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 hover:underline text-sm">
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t">
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