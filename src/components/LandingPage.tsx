import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="landing-content">
                <h1 className="landing-title">Bem-vindo ao Project Infinity</h1>
                
                <div className="landing-description">
                    <p>
                        Explore a história como nunca antes! Converse com personagens históricos
                        e aprenda diretamente com suas experiências e perspectivas únicas.
                    </p>
                    
                    <div className="features">
                        <div className="feature-item">
                            <h3>🎭 Personagens Históricos</h3>
                            <p>Interaja com figuras importantes da história mundial</p>
                        </div>
                        
                        <div className="feature-item">
                            <h3>🌍 Múltiplos Períodos</h3>
                            <p>Explore diferentes épocas e contextos históricos</p>
                        </div>
                        
                        <div className="feature-item">
                            <h3>💬 Conversas Realistas</h3>
                            <p>Diálogos imersivos baseados em fatos históricos</p>
                        </div>
                        
                        <div className="feature-item">
                            <h3>🎓 Aprendizado Interativo</h3>
                            <p>Aprenda história de forma envolvente e dinâmica</p>
                        </div>
                    </div>
                </div>

                <button 
                    className="start-button"
                    onClick={() => navigate('/select')}
                >
                    Começar Jornada
                </button>
            </div>
        </div>
    );
} 