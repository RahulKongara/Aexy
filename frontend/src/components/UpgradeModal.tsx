interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: (tier: 'STANDARD' | 'PREMIUM') => void;
    currentTier: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    onUpgrade,
    currentTier,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#001219] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 modal max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Upgrade Your Plan</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="border-2 border-blue-500 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-2">Standard</h3>
                        <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm">/mo</span></p>
                        <ul className="space-y-2 mb-6 flex flex-col justify-around items-center">
                            <li className="flex items-center"><span className="text-green-500 mr-2">&#10004;</span> 15 conversations/day</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">&#10004;</span> All scenarios</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">&#10004;</span> Detailed feedback</li>
                        </ul>
                        <button onClick={() => onUpgrade('STANDARD')} disabled={currentTier === 'STANDARD' || currentTier === 'PREMIUM'} className="w-full bg-blue-500 text-white py-2 rounded-lg h-m-t h-m-b hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {currentTier === 'STANDARD' ? 'Current Plan' : 'Upgrade'}
                        </button>
                    </div>

                    <div className="border-2 border-green-500 rounded-lg p-6 relative">
                        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm">
                            Popular
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Premium</h3>
                        <p className="text-3xl font-bold mb-4">$19.99<span className="text-sm">/mo</span></p>
                        <ul className="space-y-2 mb-6 flex flex-col justify-around items-center">
                            <li className="flex items-center"><span className="text-green-500 mr-2">&#10004;</span> Unlimited conversations/day</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">&#10004;</span> All scenarios</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">&#10004;</span> Advanced AI feedback</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">&#10004;</span> Priority support</li>
                        </ul>
                        <button onClick={() => onUpgrade('PREMIUM')} disabled={currentTier === 'PREMIUM'} className="w-full bg-purple-500 text-white h-m-t h-m-b py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {currentTier === 'STANDARD' ? 'Current Plan' : 'Upgrade'}
                        </button>
                    </div>
                </div>

                <button onClick={onClose} className="w-full py-2 h-m-t bg-amber-800 border rounded-lg hover:bg-gray-50">Close</button>
            </div>
        </div>
    );
}