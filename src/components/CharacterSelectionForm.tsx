import { useState, useEffect } from 'react';
import { ChatFormData } from '../types';
import { fetchCharacterData, fetchHistoricalPeriods, fetchHistoricalFactors, fetchLanguages } from '../services/api';
import './CharacterSelectionForm.css';

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
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="form-content">
                <h2 className="form-title">Escolha seu Personagem</h2>
                
                {/* Seleção de Personagem */}
                <div className="character-grid">
                    {Object.entries(characters).map(([id, character]) => (
                        <div
                            key={id}
                            className={`character-card ${selectedCharacter === id ? 'selected' : ''}`}
                            onClick={() => handleCharacterChange(id)}
                        >
                            <h3 className="character-name">{character.name}</h3>
                            <p className="character-description">{character.description}</p>
                        </div>
                    ))}
                </div>

                {selectedCharacter && (
                    <>
                        {/* Seleção de Período Histórico */}
                        <div className="select-group">
                            <label className="select-label">
                                Período Histórico
                            </label>
                            <select
                                className="select-input"
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
                        <div className="select-group">
                            <label className="select-label">
                                Fator Histórico
                            </label>
                            <select
                                className="select-input"
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
                        <div className="select-group">
                            <label className="select-label">
                                Idioma
                            </label>
                            <select
                                className="select-input"
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
                                <div className="language-examples">
                                    <p className="examples-title">Exemplos:</p>
                                    <ul className="examples-list">
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
                className="submit-button"
            >
                Iniciar Conversa
            </button>
        </form>
    );
} 