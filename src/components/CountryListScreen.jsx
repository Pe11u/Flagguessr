import React, { useState, useMemo } from 'react';
import { REGIONS } from '../data/flags';

const CountryListScreen = ({ lang, flags, scores, onBack, onStart }) => {
  const [search, setSearch] = useState('');
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryThreshold, setRetryThreshold] = useState(80);
  const [retryCount, setRetryCount] = useState(10);
  const [statsMode, setStatsMode] = useState('choice'); // 'choice', 'typing', 'name_to_flag'

  const grouped = useMemo(() => {
    const data = {};
    Object.keys(REGIONS).forEach(r => {
      if (r === 'all') return;
      data[r] = [];
    });

    flags.forEach(f => {
      const region = f.region === 'all' ? 'asia' : f.region;
      if (data[region]) {
        data[region].push(f);
      } else {
        if (!data['other']) data['other'] = [];
        data['other'].push(f);
      }
    });

    Object.keys(data).forEach(r => {
      data[r].sort((a, b) => {
        const nameA = lang === 'jp' ? a.name_jp : a.name_en;
        const nameB = lang === 'jp' ? b.name_jp : b.name_en;
        return nameA.localeCompare(nameB, lang === 'jp' ? 'ja' : 'en');
      });
    });

    return data;
  }, [flags, lang]);

  const t = {
    title: lang === 'jp' ? '国/地域リスト' : 'Country List',
    back: lang === 'jp' ? '戻る' : 'Back',
    searchPlaceholder: lang === 'jp' ? '検索...' : 'Search...',
    stats: lang === 'jp' ? (c, w) => `正解: ${c} | 失敗: ${w}` : (c, w) => `Correct: ${c} | Wrong: ${w}`,
    retry: lang === 'jp' ? 'やり直しクイズ' : 'Retry Quiz',
    retryTitle: lang === 'jp' ? 'やり直しクイズ設定' : 'Retry Quiz Settings',
    threshold: lang === 'jp' ? '正答率しきい値' : 'Accuracy Threshold',
    count: lang === 'jp' ? '問題数' : 'Question Count',
    start: lang === 'jp' ? '開始' : 'Start',
    noTarget: lang === 'jp' ? '対象となる国が見つかりません。' : 'No target countries found.',
    modeChoice: lang === 'jp' ? '4択問題' : 'Multiple Choice',
    modeTyping: lang === 'jp' ? 'タイピング' : 'Typing',
    modeNameToFlag: lang === 'jp' ? '国旗で選ぶ' : 'Guess by Flag',
  };

  const getAccuracyColor = (correct, wrong) => {
    const total = correct + wrong;
    if (total === 0) return { bg: 'rgba(107, 114, 128, 0.4)', text: '#fff' };
    const rate = (correct / total) * 100;
    
    if (rate >= 90) return { bg: 'rgba(59, 130, 246, 0.9)', text: '#fff' };
    if (rate >= 80) return { bg: 'rgba(125, 211, 252, 0.9)', text: '#000' };
    if (rate >= 70) return { bg: 'rgba(163, 230, 53, 0.9)', text: '#000' };
    if (rate >= 50) return { bg: 'rgba(255, 255, 255, 0.9)', text: '#000' };
    if (rate >= 40) return { bg: 'rgba(251, 146, 60, 0.9)', text: '#000' };
    if (rate >= 25) return { bg: 'rgba(248, 113, 113, 0.9)', text: '#000' };
    return { bg: 'rgba(185, 28, 28, 0.9)', text: '#fff' };
  };

  const handleStartRetry = () => {
    const targetFlags = flags.filter(f => {
      const modeScores = scores[f.id]?.[statsMode] || { correct: 0, wrong: 0 };
      const total = modeScores.correct + modeScores.wrong;
      if (total === 0) return false;
      const rate = (modeScores.correct / total) * 100;
      return rate <= retryThreshold;
    });

    if (targetFlags.length === 0) {
      alert(t.noTarget);
      return;
    }

    onStart(targetFlags.slice(0, retryCount === 'all' ? targetFlags.length : retryCount));
  };

  return (
    <>
      <div className="glass-panel" style={{ width: '95%', maxWidth: '800px', height: '90vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30, 41, 59, 0.95)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="title" style={{ margin: 0, fontSize: '1.5rem' }}>{t.title}</h2>
            <button className="btn btn-secondary" onClick={onBack}>{t.back}</button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <select 
              className="select" 
              value={statsMode} 
              onChange={(e) => setStatsMode(e.target.value)}
              style={{ flex: 1, color: '#fff', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <option value="choice" style={{ color: '#000' }}>{t.modeChoice}</option>
              <option value="typing" style={{ color: '#000' }}>{t.modeTyping}</option>
              <option value="name_to_flag" style={{ color: '#000' }}>{t.modeNameToFlag}</option>
            </select>
            <input
              type="text"
              className="input"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 2 }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {Object.entries(grouped).map(([regKey, regFlags]) => {
            const filteredFlags = regFlags.filter(f => {
              const name = (lang === 'jp' ? f.name_jp : f.name_en).toLowerCase();
              return name.includes(search.toLowerCase());
            });

            if (filteredFlags.length === 0) return null;

            return (
              <div key={regKey} style={{ marginBottom: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', color: '#ffcd00' }}>
                  {lang === 'jp' ? REGIONS[regKey]?.label_jp : REGIONS[regKey]?.label_en}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {filteredFlags.map(f => {
                    const modeScores = scores[f.id]?.[statsMode] || { correct: 0, wrong: 0 };
                    const colors = getAccuracyColor(modeScores.correct, modeScores.wrong);
                    return (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: colors.bg, color: colors.text, borderRadius: '8px', transition: 'all 0.2s' }}>
                        <img src={f.imageUrl} alt="" style={{ width: '50px', height: '33px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lang === 'jp' ? f.name_jp : f.name_en}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            {t.stats(modeScores.correct, modeScores.wrong)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30, 41, 59, 0.95)', textAlign: 'center' }}>
          <button className="btn" style={{ width: '100%', maxWidth: '400px' }} onClick={() => setShowRetryModal(true)}>
            {t.retry}
          </button>
        </div>
      </div>

      {showRetryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', animation: 'slideUp 0.3s ease-out' }}>
            <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t.retryTitle}</h2>
            
            <div className="form-group">
              <label>{t.threshold}: {retryThreshold}%</label>
              <input 
                type="range" 
                min="0" 
                max="80" 
                step="5" 
                value={retryThreshold} 
                onChange={(e) => setRetryThreshold(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>{t.count}</label>
              <select className="select" value={retryCount} onChange={(e) => setRetryCount(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ color: '#000' }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value="all">{lang === 'jp' ? 'すべて' : 'All'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRetryModal(false)}>{t.back}</button>
              <button className="btn" style={{ flex: 1 }} onClick={handleStartRetry}>{t.start}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CountryListScreen;
