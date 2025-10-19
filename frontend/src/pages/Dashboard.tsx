import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConversationLimit } from "../hooks/useConversationLimit";
import { ScenarioCard } from "../components/ScenarioCard";
import { UpgradeModal } from "../components/UpgradeModal";
import api from '../services/api';
import type { Scenario } from "../types";
import { FaFire, FaStop, FaRegStar, FaChevronCircleUp } from "react-icons/fa";


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
        <div className="min-h-screen bg-[#001219]">
            <header className="shadow">
                <div className="h-m-t h-m-b max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#ee9b00]">Aexy</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <button onClick={() => navigate('/history')} className="header-margin text-base sm:text-lg text-[#e9d8a6] hover:underline cursor-pointer">
                            History
                        </button>
                        <span className="text-sm sm:text-lg header-margin text-white truncate max-w-[200px] sm:max-w-none">{user?.email}</span>
                        <button onClick={logout} className="text-base sm:text-lg header-margin logout-btn rounded-2xl text-white bg-[#ae2012] hover:underline cursor-pointer px-4 py-2">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 p-4 sm:p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 flex flex-col sm:flex-row justify-around items-center gap-2">
                        <div className="text-3xl sm:text-4xl text-white drop-shadow-lg">
                            <FaFire className="animate-pulse" />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                                {limit?.streak || 0}
                            </div>
                            <div className="text-xs sm:text-sm text-orange-50 font-medium">Day Streak</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-4 sm:p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 flex flex-col sm:flex-row justify-around items-center gap-2">
                        <div className="text-3xl sm:text-4xl text-white drop-shadow-lg">
                            <FaStop />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                                {limit?.used}/{limit?.limit}
                            </div>
                            <div className="text-xs sm:text-sm text-blue-50 font-medium">Today's Chats</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 sm:p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 flex flex-col sm:flex-row justify-around items-center gap-2">
                        <div className="text-3xl sm:text-4xl text-white drop-shadow-lg">
                            <FaRegStar />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                                {user?.tier}
                            </div>
                            <div className="text-xs sm:text-sm text-purple-50 font-medium">Current Tier</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-400 to-teal-500 p-4 sm:p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 flex flex-col sm:flex-row justify-around items-center gap-2">
                        <div className="text-3xl sm:text-4xl text-white drop-shadow-lg">
                            <FaChevronCircleUp />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                                Level 5
                            </div>
                            <div className="text-xs sm:text-sm text-green-50 font-medium">Your Level</div>
                        </div>
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

                    <div className="mb-6 w-full h-m-b col-span-1 sm:col-span-2 lg:col-span-4">
                        <h2 className="text-xl sm:text-2xl text-amber-50 font-bold mb-4">Choose a Scenario</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                </div>
                {user?.tier === 'FREE' && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 text-center">
                        <h3 className="text-2xl font-bold mb-2">Ready for More?</h3>
                        <p className="mb-4">Upgrade to unlock unlimited conversations and advanced features</p>
                        <button
                            onClick={() => setShowUpgrade(true)}
                            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 logout-btn"
                        >
                            View Plans
                        </button>
                    </div>
                )}
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