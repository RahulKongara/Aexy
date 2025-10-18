import type { Scenario } from "../types";

interface ScenarioCardProps {
    scenario: Scenario,
    onSelect: (scenario: string) => void;
    disabled?: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect, disabled }) => {
    return (
        <button onClick={() => onSelect(scenario.id)} disabled={disabled} className={`p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
            <div className="text-4xl mb-3">{scenario.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{scenario.title}</h3>
            <p className="text-sm text-gray-600">{scenario.description}</p>
        </button>
    );
}