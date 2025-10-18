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
    const { messages, isConnected, isTyping, conId, startConversation, sendMessage, endConversation } = useWebSocket(token);

    const [inputValue, setInputValue] = useState('');
    const [isEnding, setIsEnding] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isConnected && !conId) {
            startConversation(scenario || undefined);
        }
    }, [isConnected, conId, scenario, startConversation]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && conId) {
            sendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleEnd = async () => {
        if (conId) {
            setIsEnding(true);
            endConversation();
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/dashboard')}
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
                            <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
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