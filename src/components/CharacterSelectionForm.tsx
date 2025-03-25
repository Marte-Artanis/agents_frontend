import { useState, useEffect } from 'react';
import { ChatFormData } from '../types';
import { fetchCharacterData, fetchHistoricalPeriods, fetchHistoricalFactors, fetchLanguages } from '../services/api';
import './CharacterSelectionForm.css';

interface CharacterSelectionFormProps {
    onSubmit: (data: ChatFormData) => void;
    token: string;
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

export default function CharacterSelectionForm({ onSubmit, token }: CharacterSelectionFormProps) {
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

    // Carregar personagens e idiomas
    useEffect(() => {
        const loadInitialData = async () => {
            if (!token) return;
            
            try {
                const [charactersResponse, languagesResponse] = await Promise.all([
                    fetch('http://localhost:8001/characters', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }).then(res => res.json()),
                    fetch('http://localhost:8001/languages', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }).then(res => res.json())
                ]);

                if (charactersResponse.error) throw new Error(charactersResponse.error);
                if (languagesResponse.error) throw new Error(languagesResponse.error);

                setCharacters(charactersResponse);
                setLanguages(languagesResponse);
            } catch (err) {
                setError('Erro ao carregar dados iniciais');
                console.error('Erro ao carregar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [token]);

    // Carregar períodos e fatores quando um personagem é selecionado
    useEffect(() => {
        const loadCharacterData = async () => {
            if (!selectedCharacter || !token) return;
            
            try {
                console.log('Carregando dados para o personagem:', selectedCharacter);
                
                const [periodsRes, factorsRes] = await Promise.all([
                    fetch(`http://localhost:8001/historical-periods/${selectedCharacter}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    fetch(`http://localhost:8001/historical-factors/${selectedCharacter}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);

                if (!periodsRes.ok || !factorsRes.ok) {
                    throw new Error('Falha ao carregar dados');
                }

                const periodsResponse = await periodsRes.json();
                const factorsResponse = await factorsRes.json();

                console.log('Resposta bruta períodos:', periodsResponse);
                console.log('Resposta bruta fatores:', factorsResponse);

                // Processar a resposta considerando que pode ser um array direto
                const periodsData = Array.isArray(periodsResponse) ? periodsResponse :
                                  periodsResponse.historical_periods || periodsResponse.data || [];
                                  
                const factorsData = Array.isArray(factorsResponse) ? factorsResponse :
                                   factorsResponse.historical_factors || factorsResponse.data || [];

                console.log('Períodos processados:', periodsData);
                console.log('Fatores processados:', factorsData);

                setPeriods(periodsData);
                setFactors(factorsData);
            } catch (err) {
                console.error('Erro detalhado ao carregar dados do personagem:', err);
                setError('Erro ao carregar dados do personagem');
            }
        };

        loadCharacterData();
    }, [selectedCharacter, token]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleCharacterChange = (character: string) => {
        console.log('Clique no personagem:', character);
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
                <button onClick={() => window.location.reload()} className="retry-button">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="form-content">
                <h2 className="form-title">Escolha seu Personagem</h2>
                
                {/* Grid de personagens */}
                <div className="character-grid">
                    {Object.entries(characters).map(([id, character]) => (
                        <button
                            key={id}
                            type="button"
                            className={`character-card ${selectedCharacter === id ? 'selected' : ''}`}
                            onClick={() => handleCharacterChange(id)}
                        >
                            <h3 className="character-name">{character.name}</h3>
                            <p className="character-description">{character.description}</p>
                        </button>
                    ))}
                </div>

                {selectedCharacter && (
                    <>
                        {/* Período Histórico */}
                        <div className="select-group">
                            <label className="select-label">
                                Período Histórico
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
                                    {Array.isArray(periods) && periods.map((period) => (
                                        <option key={period} value={period}>
                                            {period}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* Fator Histórico */}
                        <div className="select-group">
                            <label className="select-label">
                                Fator Histórico
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
                                    {Array.isArray(factors) && factors.map((factor) => (
                                        <option key={factor} value={factor}>
                                            {factor}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* Idioma */}
                        <div className="select-group">
                            <label className="select-label">
                                Idioma
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
                            </label>
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
