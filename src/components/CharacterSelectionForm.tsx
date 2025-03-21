import { useState, useEffect } from 'react';
import { ChatFormData } from '../types';
import { fetchCharacterData, fetchHistoricalPeriods, fetchHistoricalFactors, fetchLanguages } from '../services/api';

interface CharacterSelectionFormProps {
    onSubmit: (data: ChatFormData) => void;
}

interface Character {
    name: string;
    description: string;
}

interface Characters {
    [key: string]: Character;
}

interface Language {
    name: string;
    description: string;
    examples: string[];
}

interface Languages {
    [key: string]: Language;
}

export default function CharacterSelectionForm({ onSubmit }: CharacterSelectionFormProps) {
    const [selectedCharacter, setSelectedCharacter] = useState<string>('');
    const [characters, setCharacters] = useState<Characters>({});
    const [periods, setPeriods] = useState<string[]>([]);
    const [factors, setFactors] = useState<string[]>([]);
    const [languages, setLanguages] = useState<Languages>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<ChatFormData>({
        character: '',
        historicalPeriod: '',
        historicalFactor: '',
        language: ''
    });

    // Carregar personagens e idiomas ao montar o componente
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [charactersResponse, languagesResponse] = await Promise.all([
                    fetchCharacterData(),
                    fetchLanguages()
                ]);

                if (charactersResponse.error) throw new Error(charactersResponse.error);
                if (languagesResponse.error) throw new Error(languagesResponse.error);

                setCharacters(charactersResponse.data);
                setLanguages(languagesResponse.data);
            } catch (err) {
                setError('Erro ao carregar dados iniciais');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Carregar períodos e fatores quando um personagem é selecionado
    useEffect(() => {
        if (selectedCharacter) {
            const loadCharacterData = async () => {
                try {
                    const [periodsResponse, factorsResponse] = await Promise.all([
                        fetchHistoricalPeriods(selectedCharacter),
                        fetchHistoricalFactors(selectedCharacter)
                    ]);

                    if (periodsResponse.error) throw new Error(periodsResponse.error);
                    if (factorsResponse.error) throw new Error(factorsResponse.error);

                    setPeriods(periodsResponse.data);
                    setFactors(factorsResponse.data);
                } catch (err) {
                    setError('Erro ao carregar dados do personagem');
                }
            };

            loadCharacterData();
        }
    }, [selectedCharacter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleCharacterChange = (character: string) => {
        setSelectedCharacter(character);
        setFormData(prev => ({
            ...prev,
            character,
            historicalPeriod: '',
            historicalFactor: ''
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Escolha seu Personagem</h2>
                
                {/* Seleção de Personagem */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(characters).map(([id, character]) => (
                        <div
                            key={id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedCharacter === id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleCharacterChange(id)}
                        >
                            <h3 className="font-bold text-lg">{character.name}</h3>
                            <p className="text-sm text-gray-600">{character.description}</p>
                        </div>
                    ))}
                </div>

                {selectedCharacter && (
                    <>
                        {/* Seleção de Período Histórico */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Período Histórico
                            </label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.historicalPeriod}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    historicalPeriod: e.target.value
                                }))}
                                required
                            >
                                <option value="">Selecione um período</option>
                                {periods.map((period) => (
                                    <option key={period} value={period}>
                                        {period}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Seleção de Fator Histórico */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Fator Histórico
                            </label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.historicalFactor}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    historicalFactor: e.target.value
                                }))}
                                required
                            >
                                <option value="">Selecione um fator</option>
                                {factors.map((factor) => (
                                    <option key={factor} value={factor}>
                                        {factor}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Seleção de Idioma */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Idioma
                            </label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.language}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    language: e.target.value
                                }))}
                                required
                            >
                                <option value="">Selecione um idioma</option>
                                {Object.entries(languages).map(([id, language]) => (
                                    <option key={id} value={id}>
                                        {language.name} - {language.description}
                                    </option>
                                ))}
                            </select>
                            {formData.language && languages[formData.language] && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <p className="font-medium">Exemplos:</p>
                                    <ul className="list-disc list-inside">
                                        {languages[formData.language].examples.map((example, index) => (
                                            <li key={index}>{example}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <button
                type="submit"
                disabled={!selectedCharacter || !formData.historicalPeriod || !formData.historicalFactor || !formData.language}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    selectedCharacter && formData.historicalPeriod && formData.historicalFactor && formData.language
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Iniciar Conversa
            </button>
        </form>
    );
} 