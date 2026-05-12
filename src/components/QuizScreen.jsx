import React, { useState, useEffect, useMemo, useRef } from 'react';
import { flagsData, REGIONS } from '../data/flags';

const QuizScreen = ({ lang, flag, currentQuestionIndex, totalQuestions, settings, onAnswer, onCancel, allFlags, accumulatedTime }) => {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const [timeSpent, setTimeSpent] = useState(0);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const answerDataRef = useRef(null);

  const t = {
    question: lang === 'jp' ? `問題 ${currentQuestionIndex + 1} / ${totalQuestions}` : `Question ${currentQuestionIndex + 1} / ${totalQuestions}`,
    typePlaceholder: lang === 'jp' ? '国名を入力...' : 'Type country name...',
    submit: lang === 'jp' ? '回答' : 'Submit',
    correct: lang === 'jp' ? '正解！' : 'Correct!',
    wrong: lang === 'jp' ? '不正解...' : 'Incorrect...',
    next: lang === 'jp' ? '次へ' : 'Next',
    cancel: lang === 'jp' ? '中止' : 'Cancel',
  };

  const options = useMemo(() => {
    if (settings.type !== 'choice') return [];

    let pool = allFlags.filter(f => f.id !== flag.id);

    if (pool.length < 3) {
      const remainingPool = flagsData.filter(f => f.id !== flag.id && !pool.find(p => p.id === f.id));
      pool = [...pool, ...remainingPool];
    }

    const shuffledPool = pool.sort(() => 0.5 - Math.random());
    const wrongOptions = shuffledPool.slice(0, 3);
    const combined = [...wrongOptions, flag].sort(() => 0.5 - Math.random());
    return combined;
  }, [flag, allFlags, settings.type]);

  const inputRef = useRef(null);

  useEffect(() => {
    setTypedAnswer('');
    setFeedback(null);
    setSelectedOption(null);
    answerDataRef.current = null;

    startTimeRef.current = performance.now();
    const updateTimer = () => {
      setTimeSpent(performance.now() - startTimeRef.current);
      timerRef.current = requestAnimationFrame(updateTimer);
    };
    timerRef.current = requestAnimationFrame(updateTimer);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => cancelAnimationFrame(timerRef.current);
  }, [flag]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (feedback !== null || settings.type !== 'choice') return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (options[idx]) {
          checkAnswer('', options[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, feedback, settings.type, onCancel]);

  const handleNext = () => {
    if (answerDataRef.current) {
      const data = answerDataRef.current;
      answerDataRef.current = null;
      setFeedback(null);
      setSelectedOption(null);
      onAnswer(
        data.isCorrect,
        flag,
        data.finalUserAnswer,
        data.questionTime
      );
    }
  };

  const checkAnswer = (userAns, optionObj = null) => {
    if (feedback) return;

    cancelAnimationFrame(timerRef.current);
    const questionTime = performance.now() - startTimeRef.current;
    setTimeSpent(questionTime);

    let isCorrect = false;
    let finalUserAnswer = '';

    if (settings.type === 'choice') {
      isCorrect = optionObj.id === flag.id;
      finalUserAnswer = lang === 'jp' ? optionObj.name_jp : optionObj.name_en;
      setSelectedOption(optionObj);
    } else {
      const normalizedInput = userAns.trim().toLowerCase();
      finalUserAnswer = userAns;
      if (settings.typingStrictness === 'strict') {
        const expected = lang === 'jp' ? flag.officialName_jp : flag.officialName_en.toLowerCase();
        isCorrect = normalizedInput === expected;
      } else {
        const accepted = lang === 'jp' ? flag.acceptedNames_jp : flag.acceptedNames_en;
        isCorrect = accepted.some(name => name.toLowerCase() === normalizedInput);
      }
    }

    setFeedback(isCorrect ? 'correct' : 'wrong');
    answerDataRef.current = { isCorrect, finalUserAnswer, questionTime };

    if (settings.type === 'choice') {
      setTimeout(handleNext, 1200);
    }
  };

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (feedback) return;
    if (!typedAnswer.trim()) {
      checkAnswer('');
      return;
    }
    checkAnswer(typedAnswer);
  };

  const isFlagToName = settings.quizMode === 'flag_to_name';

  return (
    <div className="glass-panel" style={{ position: 'relative', padding: isFlagToName ? '1.5rem' : '1rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isFlagToName ? '1rem' : '0.5rem' }}>
        <button
          onClick={onCancel}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: 600 }}
        >
          {t.cancel}
        </button>
        <p className="subtitle" style={{ margin: 0, fontWeight: 600 }}>{t.question}</p>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="flag-image-container" style={{ height: isFlagToName ? '180px' : 'auto', marginBottom: isFlagToName ? '1.5rem' : '0.5rem' }}>
        {isFlagToName ? (
          <img src={flag.imageUrl} alt="Flag" className="flag-image" />
        ) : (
          <h2 style={{ fontSize: '2.3rem', textAlign: 'center', margin: '0.3rem 0', lineHeight: 1.2 }}>
            {lang === 'jp' ? flag.name_jp : flag.name_en}
          </h2>
        )}
      </div>

      {settings.type === 'choice' ? (
        <div className="options-grid" style={!isFlagToName ? { gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } : {}}>
          {options.map((opt, idx) => {
            let className = "option-btn";
            if (feedback) {
              if (opt.id === flag.id) className += " correct";
              else if (selectedOption && selectedOption.id === opt.id) className += " wrong";
            }
            return (
              <button
                key={opt.id}
                className={className}
                onClick={() => checkAnswer('', opt)}
                disabled={feedback !== null}
                style={!isFlagToName ? { padding: '0.5rem', height: 'auto' } : {}}
              >
                {isFlagToName ? (
                  <>
                    <span style={{ opacity: 0.5, marginRight: '0.5rem', fontSize: '0.9rem' }}>{idx + 1}.</span>
                    {lang === 'jp' ? opt.name_jp : opt.name_en}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={opt.imageUrl} alt="" style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{idx + 1}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleTypingSubmit} className="typing-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder={t.typePlaceholder}
            disabled={feedback !== null}
            autoFocus
          />
          {!feedback && <button type="submit" className="btn">{t.submit}</button>}
        </form>
      )}

      {feedback && (
        <div className={`feedback-message ${feedback}`}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {feedback === 'correct' ? t.correct : t.wrong}
          </div>
          <div className="correct-answer">
            {lang === 'jp' ? flag.name_jp : flag.name_en}
            {!isFlagToName && (
              <div style={{ marginTop: '0.5rem' }}>
                <img src={flag.imageUrl} alt="" style={{ height: '60px', borderRadius: '4px' }} />
              </div>
            )}
            <br />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {lang === 'jp' ? flag.officialName_jp : flag.officialName_en}
              <br />
              📍 {lang === 'jp' ? REGIONS[flag.region]?.label_jp : REGIONS[flag.region]?.label_en}
            </span>
          </div>
          {settings.type === 'typing' && (
            <button className="btn" style={{ marginTop: '1rem' }} onClick={handleNext} autoFocus>
              {t.next}
            </button>
          )}
          {(settings.type === 'choice' && feedback === 'wrong') && (
            <button className="btn" style={{ marginTop: '1rem' }} onClick={handleNext} autoFocus>
              {t.next}
            </button>
          )}
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        color: 'var(--text-secondary)',
        fontFamily: 'monospace',
        fontSize: '0.9rem'
      }}>
        ⏱ {((accumulatedTime + timeSpent) / 1000).toFixed(3)}s
      </div>
    </div>
  );
};

export default QuizScreen;
