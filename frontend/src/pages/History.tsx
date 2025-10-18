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
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-blue-600">Conversation History</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {conversations.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
                        <p className="text-gray-600 mb-6">Start a conversation to see it here</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Start Practicing
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {conversations.map((conv) => (
                            <div key={conv.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">
                                            {conv.scenario
                                                ? conv.scenario.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                                                : 'General Conversation'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(conv.startTime).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${conv.endTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {conv.endTime ? 'Completed' : 'In Progress'}
                                    </span>
                                </div>

                                {conv.summary && (
                                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                                        <p className="text-sm text-gray-700">{conv.summary}</p>
                                    </div>
                                )}

                                {conv.feedback && (
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                                        <p className="text-sm text-gray-700">{conv.feedback}</p>
                                    </div>
                                )}

                                <div className="mt-4 text-sm text-gray-500">
                                    Duration:{' '}
                                    {conv.endTime
                                        ? Math.round(
                                            (new Date(conv.endTime).getTime() - new Date(conv.startTime).getTime()) / 60000
                                        ) + ' minutes'
                                        : 'Ongoing'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};