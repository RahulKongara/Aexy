import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Conversation } from '../types';

export const History: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await api.getConvos();
                setConversations(data);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading history...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
                            >
                                <span className="text-lg sm:text-xl group-hover:-translate-x-1 transition-transform duration-200">←</span>
                                <span className="ml-2 hidden sm:inline">Back</span>
                            </button>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Conversation History
                            </h1>
                        </div>
                        <div className="text-sm text-gray-500 hidden sm:block">
                            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {conversations.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 lg:py-24">
                        <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 animate-bounce">📝</div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">No conversations yet</h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto px-4">
                            Start your first conversation to begin tracking your progress
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                        >
                            Start Practicing
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6 lg:gap-8">
                        {conversations.map((conv, index) => (
                            <div
                                key={conv.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 lg:p-8 transform hover:-translate-y-1 border border-gray-100"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                                            <span className="text-2xl">💬</span>
                                            {conv.scenario
                                                ? conv.scenario.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                                                : 'General Conversation'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                📅 {new Date(conv.startTime).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="flex items-center gap-1">
                                                ⏱️ {conv.endTime
                                                    ? Math.round(
                                                        (new Date(conv.endTime).getTime() - new Date(conv.startTime).getTime()) / 60000
                                                    ) + ' min'
                                                    : 'Ongoing'}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap self-start ${conv.endTime
                                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                                : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200'
                                            }`}
                                    >
                                        {conv.endTime ? '✓ Completed' : '⟳ In Progress'}
                                    </span>
                                </div>

                                {conv.summary && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 mb-4 border border-blue-100">
                                        <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                            <span>📋</span> Summary
                                        </p>
                                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{conv.summary}</p>
                                    </div>
                                )}

                                {conv.feedback && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border border-green-100">
                                        <p className="text-xs sm:text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                                            <span>💡</span> Feedback
                                        </p>
                                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{conv.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};