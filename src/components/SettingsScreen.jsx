import React from 'react';
import { FLAG_DIFFICULTIES, REGIONS, flagsData } from '../data/flags';

const SettingsScreen = ({ lang, settings, setSettings, onStart }) => {
  const t = {
    title: lang === 'jp' ? 'Flagguessr' : 'Flagguessr',
    region: lang === 'jp' ? '地域を選択' : 'Select Region',
    difficulty: lang === 'jp' ? '難易度を選択' : 'Select Difficulty',
    questionCount: lang === 'jp' ? '問題数 (手動入力)' : 'Number of Questions',
    quizMode: lang === 'jp' ? '出題方法' : 'Question Mode',
    flagToName: lang === 'jp' ? '国名で選ぶ' : 'Guess by Name',
    nameToFlag: lang === 'jp' ? '国旗で選ぶ' : 'Guess by Flag',
    quizType: lang === 'jp' ? '回答形式' : 'Input Type',
    choice4: lang === 'jp' ? '4択問題' : 'Multiple Choice',
    typing: lang === 'jp' ? 'タイピング' : 'Typing',
    strictness: lang === 'jp' ? '判定の厳しさ' : 'Typing Strictness',
    flexible: lang === 'jp' ? '柔軟 (略称も可)' : 'Flexible (Accepted Names)',
    strict: lang === 'jp' ? '厳密 (正式名称のみ)' : 'Strict (Official Names Only)',
    start: lang === 'jp' ? 'スタート' : 'Start Quiz',
  };

  const getFlagPool = () => {
    let pool = [];
    const d = settings.difficulty;

    if (d === 'common_sense') pool = flagsData.filter(f => f.difficulty === 'common_sense');
    else if (d === 'easy') pool = flagsData.filter(f => ['common_sense', 'easy'].includes(f.difficulty));
    else if (d === 'normal') pool = flagsData.filter(f => ['common_sense', 'easy', 'normal'].includes(f.difficulty));
    else if (d === 'hard') pool = flagsData.filter(f => f.difficulty === 'hard');
    else if (d === 'extreme') pool = flagsData.filter(f => f.difficulty === 'extreme');
    else if (d === 'demon') pool = flagsData.filter(f => f.difficulty === 'demon');

    if (!settings.regions.includes('all') && settings.regions.length > 0) {
      pool = pool.filter(f => settings.regions.includes(f.region));
    }
    return pool;
  };

  const getMaxAllowed = () => {
    const d = settings.difficulty;
    if (d === 'common_sense') return 15;
    if (d === 'easy') return 30;
    if (d === 'normal') return 50;
    if (d === 'hard') return 99;
    if (d === 'extreme') return 45;
    if (d === 'demon') return 57;
    return 10;
  };

  const maxQuestions = getMaxAllowed();

  const handleStart = () => {
    const selectedFlags = getFlagPool();
    if (selectedFlags.length === 0) return;
    onStart(selectedFlags);
  };

  return (
    <div className="glass-panel">
      <h1 className="title" style={{ marginBottom: '1.5rem' }}>{t.title}</h1>

      <div className="form-group">
        <label>{t.region}</label>
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
          {Object.entries(REGIONS).map(([key, reg]) => {
            const isSelected = settings.regions.includes(key);
            return (
              <button
                key={key}
                className={`btn ${isSelected ? '' : 'btn-secondary'}`}
                onClick={() => {
                  let newRegions = [...settings.regions];
                  if (key === 'all') {
                    newRegions = ['all'];
                  } else {
                    newRegions = newRegions.filter(r => r !== 'all');
                    if (newRegions.includes(key)) {
                      newRegions = newRegions.filter(r => r !== key);
                      if (newRegions.length === 0) newRegions = ['all'];
                    } else {
                      newRegions.push(key);
                    }
                  }
                  setSettings({ ...settings, regions: newRegions });
                }}
                style={{ padding: '0.5rem', fontSize: '0.85rem', minHeight: '40px' }}
              >
                {lang === 'jp' ? reg.label_jp : reg.label_en}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label>{t.difficulty}</label>
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
          {Object.entries(FLAG_DIFFICULTIES).map(([key, diff]) => {
            const isSelected = settings.difficulty === key;
            return (
              <button
                key={key}
                className={`btn ${isSelected ? '' : 'btn-secondary'}`}
                onClick={() => {
                  const newMax = (key === 'common_sense' ? 15 : key === 'easy' ? 30 : key === 'normal' ? 50 : key === 'hard' ? 99 : key === 'extreme' ? 195 : key === 'demon' ? 57 : 10);
                  let newCount = settings.questionCount;
                  if (newCount > newMax) newCount = newMax;
                  setSettings({ ...settings, difficulty: key, questionCount: newCount });
                }}
                style={{ padding: '0.5rem', fontSize: '0.85rem', minHeight: '40px' }}
              >
                {lang === 'jp' ? diff.label_jp : diff.label_en}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label>{t.questionCount} (Max: {maxQuestions})</label>
        <input
          type="number"
          min="1"
          max={maxQuestions}
          value={settings.questionCount}
          onChange={(e) => {
            let val = parseInt(e.target.value) || 1;
            if (val > maxQuestions) val = maxQuestions;
            setSettings({ ...settings, questionCount: val });
          }}
        />
      </div>

      <div className="form-group">
        <label>{t.quizMode}</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${settings.quizMode === 'flag_to_name' ? '' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setSettings({ ...settings, quizMode: 'flag_to_name' })}
          >
            {t.flagToName}
          </button>
          <button
            className={`btn ${settings.quizMode === 'name_to_flag' ? '' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setSettings({ ...settings, quizMode: 'name_to_flag', type: 'choice' })}
          >
            {t.nameToFlag}
          </button>
        </div>
      </div>

      {settings.quizMode === 'flag_to_name' && (
        <div className="form-group" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <label>{t.quizType}</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className={`btn ${settings.type === 'choice' ? '' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setSettings({ ...settings, type: 'choice' })}
            >
              {t.choice4}
            </button>
            <button
              className={`btn ${settings.type === 'typing' ? '' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setSettings({ ...settings, type: 'typing' })}
            >
              {t.typing}
            </button>
          </div>
        </div>
      )}

      {(settings.quizMode === 'flag_to_name' && settings.type === 'typing') && (
        <div className="form-group" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <label>{t.strictness}</label>
          <select
            value={settings.typingStrictness}
            onChange={(e) => setSettings({ ...settings, typingStrictness: e.target.value })}
          >
            <option value="flexible">{t.flexible}</option>
            <option value="strict">{t.strict}</option>
          </select>
        </div>
      )}

      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button className="btn" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }} onClick={handleStart}>
          {t.start}
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
