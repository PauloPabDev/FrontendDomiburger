import './DeprecationBanner.css';

const DeprecationBanner = () => {
  return (
    <div className="deprecation-banner">
      <div className="deprecation-banner-content">
        <div className="deprecation-banner-icon">⚠️</div>
        <div className="deprecation-banner-text">
          <h2 className="deprecation-banner-title">Esta aplicación se cerrará pronto</h2>
          <p className="deprecation-banner-message">
            Por favor, utiliza <strong>domiburguer.com</strong> para acceder a la nueva versión
          </p>
        </div>
        <a
          href="https://domiburguer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="deprecation-banner-button"
        >
          Acceder a domiburguer.com →
        </a>
      </div>
    </div>
  );
};

export default DeprecationBanner;
