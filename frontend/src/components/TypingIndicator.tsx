export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex justify-start mb-4">
            <div className="bg-gray-200 msgp px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        </div>
    );
}