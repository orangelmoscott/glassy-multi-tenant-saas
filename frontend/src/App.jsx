import { useState } from 'react'
import './index.css'

function App() {
  const plans = [
    {
      name: "Plan Autónomo",
      price: "29€",
      description: "Para cristaleros independientes.",
      features: [
        "Hasta 40 Clientes",
        "1 Cristalero Activo",
        "1 Ruta Diaria",
        "Facturación por Email",
        "Acceso a Facturas"
      ],
      highlight: false
    },
    {
      name: "Plan Pro",
      price: "49€",
      description: "Para pequeñas empresas en crecimiento.",
      features: [
        "Hasta 150 Clientes",
        "5 Cristaleros Activos",
        "5 Rutas Diarias",
        "Dashboard Profesional de Rendimiento",
        "Módulo de Facturación Avanzada"
      ],
      highlight: true
    },
    {
      name: "Plan Business",
      price: "99€",
      description: "Para empresas consolidadas.",
      features: [
        "Clientes Ilimitados",
        "Cristaleros Ilimitados",
        "Rutas Ilimitadas",
        "Dashboard de Inteligencia de Negocio",
        "Facturación Ilimitada y Prioritaria"
      ],
      highlight: false
    }
  ];

  return (
    <div className="main-wrapper">
      <div className="accent-glow top-left"></div>
      <div className="accent-glow bottom-right"></div>
      
      <div className="glass-container glass-main">
        <header className="glass-header">
          <div className="logo-section">
            <div className="glass-ring"></div>
            <span className="brand-name">GLASSY</span>
          </div>
          <nav>
            <a href="#features">Características</a>
            <a href="#pricing">Planes</a>
            <button className="nav-btn">Acceso</button>
          </nav>
        </header>

        <main className="hero-section text-center">
          <h1>Elegancia y <br /><span className="gradient-text">Máximo Rendimiento.</span></h1>
          <p className="hero-text">
            Gestiona tu negocio de cristales con una interfaz premium de última generación. 
            Transparencia total para profesionales que buscan excelencia.
          </p>
        </main>

        <section id="pricing" className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`glass-card pricing-card ${plan.highlight ? 'plan-highlight' : ''}`}>
              {plan.highlight && <div className="popular-badge">EL MÁS POPULAR</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-desc">{plan.description}</p>
              <div className="plan-price">{plan.price}<span>/ mes</span></div>
              
              <ul className="feature-list">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex}>
                    <i className="check-icon">✓</i> {feature}
                  </li>
                ))}
              </ul>

              <button className={`plan-btn ${plan.highlight ? 'primary' : 'secondary'}`}>
                Empezar Plan
              </button>
            </div>
          ))}
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .main-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100vw;
          min-height: 100vh;
          padding: 2rem;
          box-sizing: border-box;
          background-color: #0c001c;
          overflow-x: hidden;
        }

        .accent-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #ff007c 0%, transparent 70%);
          filter: blur(120px);
          opacity: 0.15;
          z-index: 1;
        }

        .top-left { top: -100px; left: -100px; }
        .bottom-right { bottom: -100px; right: -100px; background: radial-gradient(circle, #7000ff 0%, transparent 70%); }

        .glass-main {
          max-width: 1200px;
          width: 100%;
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }

        .text-center { text-align: center; margin: 0 auto; }

        .glass-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .logo-section { display: flex; align-items: center; gap: 12px; }
        .glass-ring {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid #ff007c;
          box-shadow: 0 0 15px rgba(255, 0, 124, 0.4);
        }
        .brand-name { font-weight: 800; font-size: 1.5rem; letter-spacing: 2px; }

        nav { display: flex; align-items: center; gap: 2rem; }
        nav a { color: rgba(255, 255, 255, 0.6); text-decoration: none; font-weight: 500; }

        .hero-section { max-width: 800px; margin-bottom: 4rem; }
        .gradient-text {
          background: linear-gradient(90deg, #ff007c, #b600ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-text { font-size: 1.1rem; color: rgba(255, 255, 255, 0.6); }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          padding: 1rem;
        }

        .pricing-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .plan-highlight {
          border: 2px solid #3b82f6;
          transform: scale(1.02);
          background: rgba(59, 130, 246, 0.05);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          right: 20px;
          background: #3b82f6;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .plan-name { font-size: 1.5rem; margin-bottom: 0.5rem; color: white; }
        .plan-desc { font-size: 0.9rem; color: rgba(255, 255, 255, 0.6); margin-bottom: 2rem; }
        .plan-price { font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 2rem; }
        .plan-price span { font-size: 1rem; color: rgba(255, 255, 255, 0.4); font-weight: 400; }

        .feature-list { list-style: none; padding: 0; margin: 0 0 2.5rem 0; flex-grow: 1; }
        .feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
        }

        .check-icon {
          color: #3b82f6;
          font-style: normal;
          font-weight: bold;
        }

        .plan-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }

        .plan-btn.primary { background: #3b82f6; color: white; border: none; }
        .plan-btn.secondary { background: transparent; color: white; border: 1px solid rgba(255, 255, 255, 0.2); }
        .plan-btn:hover { transform: translateY(-2px); opacity: 0.9; }
      ` }} />
    </div>
  )
}

export default App
