import React from 'react';

const LanguageToggle = ({ lang, setLang }) => {
  return (
    <div className="lang-toggle">
      <button
        className={`lang-btn ${lang === 'jp' ? 'active' : ''}`}
        onClick={() => setLang('jp')}
      >
        日本語
      </button>
      <button
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
      >
        English
      </button>
    </div>
  );
};

export default LanguageToggle;
