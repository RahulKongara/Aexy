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
    const hasStartedConversation = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        // console.log('ConversationScreen state:', { isConnected, conId, summary: !!summary, scenario, hasStarted: hasStartedConversation.current });
        if (isConnected && !conId && !summary && !hasStartedConversation.current) {
            // console.log('✅ Calling startConversation');
            hasStartedConversation.current = true;
            startConversation(scenario || undefined);
        } 
    }, [isConnected, conId, scenario, startConversation, summary]);

    // Reset the flag when conId is set (conversation successfully started)
    useEffect(() => {
        if (conId) {
            hasStartedConversation.current = false;
        }
    }, [conId]);

    // Reset the flag when navigating to a new scenario
    useEffect(() => {
        hasStartedConversation.current = false;
    }, [scenario]);

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
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <button
                onClick={handleBackToDashboard}
                className="text-blue-500 hover:text-blue-600"
                >
                ← Back
                </button>
                <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    AI
                </div>
                <div>
                    <h2 className="font-semibold text-sm">
                    {scenario?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Conversation'}
                    </h2>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span>{isConnected ? 'Active now' : 'Connecting...'}</span>
                    </div>
                </div>
                </div>
            </div>
            <button
                onClick={handleEnd}
                disabled={isEnding || !conId}
                className="text-red-500 hover:text-red-600 disabled:opacity-50 text-sm font-medium"
            >
                {isEnding ? 'Ending...' : 'End'}
            </button>
            </header>

            {/* Error Alert */}
            {error && (
            <div className="bg-red-50 border-b border-red-200 p-3 mx-4 mt-2 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                <span className="text-red-500 text-lg mr-2">⚠️</span>
                <p className="text-red-700 text-xs">{error}</p>
                </div>
                <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                >
                ✕
                </button>
            </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !isTyping && (
                <div className="text-center text-gray-400 mt-12">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-sm">Starting conversation...</p>
                </div>
            )}

            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t px-4 py-3 safe-area-inset-bottom">
            <form onSubmit={handleSend} className="flex items-end space-x-2">
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Message..."
                    disabled={!isConnected || !conId || isEnding}
                    className="flex-1 bg-transparent focus:outline-none disabled:opacity-50 text-sm"
                />
                </div>
                <button
                type="submit"
                disabled={!inputValue.trim() || !isConnected || !conId || isEnding}
                className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                >
                <span className="text-lg">↑</span>
                </button>
            </form>
            </div>
        </div>
    );
};