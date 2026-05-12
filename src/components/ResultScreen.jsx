import React from 'react';

const ResultScreen = ({ lang, score, total, mistakes, onRestart }) => {
  const t = {
    title: lang === 'jp' ? 'クイズ結果' : 'Quiz Results',
    score: lang === 'jp' ? 'スコア' : 'Score',
    perfect: lang === 'jp' ? '完璧です！素晴らしい！' : 'Perfect! Outstanding!',
    good: lang === 'jp' ? 'よくできました！' : 'Good job!',
    needsPractice: lang === 'jp' ? 'もっと練習しましょう！' : 'Keep practicing!',
    mistakes: lang === 'jp' ? '間違えた問題' : 'Mistakes Review',
    yourAnswer: lang === 'jp' ? 'あなたの回答: ' : 'Your Answer: ',
    correctAnswer: lang === 'jp' ? '正解: ' : 'Correct Answer: ',
    restart: lang === 'jp' ? 'もう一度プレイ' : 'Play Again',
    noMistakes: lang === 'jp' ? '間違えた問題はありません。' : 'No mistakes made.',
  };

  const percentage = Math.round((score / total) * 100);

  let feedbackText = t.needsPractice;
  if (percentage === 100) feedbackText = t.perfect;
  else if (percentage >= 70) feedbackText = t.good;

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '700px' }}>
      <h1 className="title" style={{ fontSize: '2.5rem' }}>{t.title}</h1>

      <div className="stats-bar">
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p>{t.score}</p>
          <div className="result-stat">{score} / {total}</div>
        </div>
      </div>

      <p className="subtitle" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        {feedbackText}
      </p>

      {mistakes.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
            {t.mistakes}
          </h2>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {mistakes.map((m, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '1rem',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px',
                alignItems: 'center'
              }}>
                <img
                  src={m.flag.imageUrl}
                  alt="Flag"
                  style={{ width: '80px', height: 'auto', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
                />
                <div>
                  <p style={{ color: 'var(--danger-color)', margin: '0 0 0.25rem' }}>
                    {t.yourAnswer} <span style={{ textDecoration: 'line-through' }}>{m.userAnswer || (lang === 'jp' ? '無回答' : 'No Answer')}</span>
                  </p>
                  <p style={{ color: 'var(--success-color)', margin: 0, fontWeight: 'bold' }}>
                    {t.correctAnswer} {m.correctAnswer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button className="btn" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }} onClick={onRestart}>
          {t.restart}
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
