import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConversationLimit } from "../hooks/useConversationLimit";
import { ScenarioCard } from "../components/ScenarioCard";
import { UpgradeModal } from "../components/UpgradeModal";
import api from '../services/api';
import type { Scenario } from "../types";

const SCENARIOS: Scenario[] = [
    {
        id: 'job-interview',
        title: 'Job Interview',
        description: 'Practice answering common interview questions',
        icon: '💼',
    },
    {
        id: 'coffee-shop',
        title: 'Coffee Shop',
        description: 'Order your favorite drink in English',
        icon: '☕',
    },
    {
        id: 'travel-planning',
        title: 'Travel Planning',
        description: 'Plan your dream vacation',
        icon: '✈️',
    },
    {
        id: 'small-talk',
        title: 'Small Talk',
        description: 'Casual conversation practice',
        icon: '💬',
    },
];

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { limit, loading, refetch } = useConversationLimit();
    const [showUpgrade, setShowUpgrade] = useState(false);
    const navigate = useNavigate();

    const handleScenarioSelect = async (scenario: string) => {
        if (!limit?.allowed) {
            setShowUpgrade(true);
            return;
        }

        try {
            await api.startConvo(scenario);
            navigate(`/conversation?scenario=${scenario}`);
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    const handleUpgrade = async (tier: 'STANDARD' | 'PREMIUM') => {
        try {
            await api.upgradeTier(tier);
            setShowUpgrade(false);
            refetch();
            alert('Subscription upgraded successfully!');
        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('Failed to upgrade subscription');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">Aexy</h1>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/history')} className="text-sm text-blue-500 hover:underline">
                            History
                        </button>
                        <span className="text-sm text-gray-600">{user?.email}</span>
                        <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-bold">{limit?.streak || 0}</div>
                        <div className="text-sm text-gray-600">Day Streak</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl mb-2"></div>
                        <div className="text-2xl font-bold">
                            {limit?.used}/{limit?.limit}
                        </div>
                        <div className="text-sm text-gray-600">Today's Conversations</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl mb-2">⭐</div>
                        <div className="text-2xl font-bold">{user?.tier}</div>
                        <div className="text-sm text-gray-600">Current Tier</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl mb-2"></div>
                        <div className="text-2xl font-bold">Level 5</div>
                        <div className="text-sm text-gray-600">Your Level</div>
                    </div>
                    {!limit?.allowed && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        You've reached your daily conversation limit ({limit?.limit} conversations).
                                        <button onClick={() => setShowUpgrade(true)} className="font-semibold underline ml-1">
                                            Upgrade to continue
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4">Choose a Scenario</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {SCENARIOS.map((scenario) => (
                                <ScenarioCard
                                    key={scenario.id}
                                    scenario={scenario}
                                    onSelect={handleScenarioSelect}
                                    disabled={!limit?.allowed}
                                />
                            ))}
                        </div>
                    </div>

                    {user?.tier === 'FREE' && (
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 text-center">
                            <h3 className="text-2xl font-bold mb-2">Ready for More?</h3>
                            <p className="mb-4">Upgrade to unlock unlimited conversations and advanced features</p>
                            <button
                            onClick={() => setShowUpgrade(true)}
                            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
                            >
                            View Plans
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <UpgradeModal
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                onUpgrade={handleUpgrade}
                currentTier={user?.tier || 'FREE'}
            />
        </div>
    );
}