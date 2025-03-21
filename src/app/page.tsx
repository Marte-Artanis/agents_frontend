'use client';

import { useRouter } from 'next/navigation';
import './page.css';

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="landing-container">
            <div className="ring-animation"></div>
            <div className="landing-content">
                <h1 className="landing-title">Jornada pela Terra-média</h1>
                <div className="elvish-text">Ash nazg durbatulûk</div>
                
                <div className="landing-description">
                    <p>
                        Embarque em uma jornada épica através da Terra-média! Converse com 
                        personagens lendários e descubra histórias nunca antes contadas.
                    </p>
                    
                    <div className="features">
                        <div className="feature-item">
                            <div className="feature-icon">🧙‍♂️</div>
                            <h3>Grandes Heróis</h3>
                            <p>De Gandalf a Aragorn, converse com os maiores heróis da Terra-média</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">🏰</div>
                            <h3>Reinos Míticos</h3>
                            <p>Explore desde o Condado até Mordor através das histórias contadas</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">💍</div>
                            <h3>Histórias Épicas</h3>
                            <p>Descubra segredos e lendas das Três Eras da Terra-média</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">⚔️</div>
                            <h3>Grandes Batalhas</h3>
                            <p>Conheça as estratégias e histórias das batalhas mais importantes</p>
                        </div>
                    </div>
                </div>

                <button 
                    className="start-button"
                    onClick={() => router.push('/select')}
                >
                    <span className="button-text">Iniciar Aventura</span>
                    <div className="sword-icon">⚔️</div>
                </button>
            </div>
        </div>
    );
}
