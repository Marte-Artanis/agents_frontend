import { useState, useEffect } from 'react';
import { ChatFormData } from '@/types';
import { fetchCharacterData, fetchHistoricalPeriods, fetchHistoricalFactors, fetchLanguages } from '@/services/api';
import styles from './CharacterSelectionForm.module.css';

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
                console.error('Erro ao carregar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Carregar períodos e fatores quando um personagem é selecionado
    useEffect(() => {
        const loadCharacterData = async () => {
            if (!selectedCharacter) return;
            
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
                console.error('Erro ao carregar dados do personagem:', err);
                setError('Erro ao carregar dados do personagem');
            }
        };

        loadCharacterData();
    }, [selectedCharacter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.character || !formData.historicalPeriod || !formData.historicalFactor || !formData.language) {
            setError('Por favor, preencha todos os campos');
            return;
        }
        
        console.log('Enviando dados:', formData);
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
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryButton}>
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formContent}>
                <h2 className={styles.formTitle}>Escolha seu Personagem</h2>
                
                {/* Grid de personagens */}
                <div className={styles.characterGrid}>
                    {Object.entries(characters).map(([id, character]) => (
                        <button
                            key={id}
                            type="button"
                            className={`${styles.characterCard} ${selectedCharacter === id ? styles.selected : ''}`}
                            onClick={() => handleCharacterChange(id)}
                        >
                            <h3 className={styles.characterName}>{character.name}</h3>
                            <p className={styles.characterDescription}>{character.description}</p>
                        </button>
                    ))}
                </div>

                {selectedCharacter && (
                    <>
                        {/* Período Histórico */}
                        <div className={styles.selectGroup}>
                            <label className={styles.selectLabel}>
                                Período Histórico
                                <select
                                    className={styles.selectInput}
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
                            </label>
                        </div>

                        {/* Fatores Históricos */}
                        <div className={styles.selectGroup}>
                            <label className={styles.selectLabel}>
                                Fatores Históricos
                                <select
                                    className={styles.selectInput}
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
                            </label>
                        </div>

                        {/* Idioma */}
                        <div className={styles.selectGroup}>
                            <label className={styles.selectLabel}>
                                Idioma
                                <select
                                    className={styles.selectInput}
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
                                            {language.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Começar Chat
                        </button>
                    </>
                )}
            </div>
        </form>
    );
} 