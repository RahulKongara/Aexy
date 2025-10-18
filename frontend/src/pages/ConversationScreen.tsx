import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { MessageBubble } from "../components/MessageBubble";
import { TypingIndicator } from "../components/TypingIndicator";

export const ConversationScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const scenario = searchParams.get('scenario');
    const navigate = useNavigate();
    const { token } = useAuth();
    const { messages, isConnected, isTyping, conId, summary, error, startConversation, sendMessage, endConversation, clearError } = useWebSocket(token);

    const [inputValue, setInputValue] = useState('');
    const [isEnding, setIsEnding] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isConnected && !conId && !summary) {
            startConversation(scenario || undefined);
        }
    }, [isConnected, conId, scenario, startConversation, summary]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && conId) {
            sendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    // const handleEnd = async () => {
    //     if (conId) {
    //         setIsEnding(true);
    //         endConversation();
    //         setTimeout(() => {
    //             navigate('/dashboard');
    //         }, 1000);
    //     }
    // };

    const handleEnd = async () => {
        if (conId) {
            setIsEnding(true);
            endConversation();
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    if (summary) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold mb-2">Great Job!</h2>
                        <p className="text-gray-600">You completed the conversation</p>
                    </div>

                    <div className="space-y-6">
                        
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2 flex items-center">
                                <span className="mr-2">📝</span> Summary
                            </h3>
                            <p className="text-gray-700">{summary.summary}</p>
                        </div>

                        
                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2 flex items-center">
                                <span className="mr-2">💡</span> Feedback
                            </h3>
                            <p className="text-gray-700">{summary.feedback}</p>
                        </div>

                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-purple-600">{summary.messageCt}</div>
                                <div className="text-sm text-gray-600 mt-1">Messages Exchanged</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-orange-600">{messages.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Your Messages</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBackToDashboard}
                        className="w-full mt-8 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleBackToDashboard}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 className="font-semibold">
                            {scenario?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Conversation'}
                        </h2>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleEnd}
                    disabled={isEnding || !conId}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                    {isEnding ? 'Ending...' : 'End Conversation'}
                </button>
            </header>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-red-500 text-xl mr-3">⚠️</span>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    {messages.length === 0 && !isTyping && (
                        <div className="text-center text-gray-500 mt-8">
                            <div className="text-4xl mb-3">👋</div>
                            <p>Starting conversation...</p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}

                    {isTyping && <TypingIndicator />}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="bg-white border-t px-4 py-4">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex space-x-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        disabled={!isConnected || !conId || isEnding}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || !isConnected || !conId || isEnding}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};