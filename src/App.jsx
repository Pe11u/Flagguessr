import { useState, useMemo, useEffect } from 'react';
import SettingsScreen from './components/SettingsScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import LanguageToggle from './components/LanguageToggle';
import CountryListScreen from './components/CountryListScreen';
import { flagsData } from './data/flags';

function App() {
  const [lang, setLang] = useState('jp');
  const [screen, setScreen] = useState('settings');
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  const [settings, setSettings] = useState({
    difficulty: 'normal',
    regions: ['all'],
    questionCount: 10,
    type: 'choice',
    typingStrictness: 'flexible',
    quizMode: 'flag_to_name',
  });

  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const prefetchImages = async () => {
      try {
        const cache = await caches.open('flag-cache-v1');
        const urlsToCache = flagsData.map(f => f.imageUrl);
        let count = 0;

        const chunkSize = 20;
        for (let i = 0; i < urlsToCache.length; i += chunkSize) {
          const chunk = urlsToCache.slice(i, i + chunkSize);
          await Promise.all(chunk.map(async (url) => {
            try {
              if (url.includes('flagpedia.net')) {
                count++;
                return;
              }

              const response = await cache.match(url);
              if (!response) {
                const fetchRes = await fetch(url, { mode: 'cors' });
                if (fetchRes.ok) {
                  await cache.put(url, fetchRes.clone());
                }
              }
            } catch (err) {
              console.warn("Failed to fetch/cache: ", url);
            }
            count++;
            if (isMounted) setLoadedCount(count);
          }));
        }

        for (const flag of flagsData) {
          try {
            if (flag.imageUrl.includes('flagpedia.net')) continue;
            const res = await cache.match(flag.imageUrl);
            if (res) {
              const blob = await res.blob();
              flag.imageUrl = URL.createObjectURL(blob);
            }
          } catch(e) {}
        }
      } catch (err) {
        console.error("Cache API failed", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    prefetchImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const startQuiz = (selectedFlags) => {

    const shuffled = [...selectedFlags].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, settings.questionCount === 'all' ? shuffled.length : settings.questionCount);

    setQuizData(selected);
    setCurrentQuestionIndex(0);
    setScore(0);
    setMistakes([]);
    setTotalTime(0);
    setScreen('quiz');
  };

  const [globalScores, setGlobalScores] = useState(() => {
    const saved = localStorage.getItem('flag_quiz_scores');
    return saved ? JSON.parse(saved) : {};
  });

  const updateGlobalScore = (flagId, isCorrect, mode) => {
    setGlobalScores(prev => {
      const newScores = { ...prev };
      if (!newScores[flagId]) newScores[flagId] = {};
      
      // Handle legacy format if exists
      if (newScores[flagId].correct !== undefined) {
        const legacy = { correct: newScores[flagId].correct, wrong: newScores[flagId].wrong };
        delete newScores[flagId].correct;
        delete newScores[flagId].wrong;
        newScores[flagId].choice = legacy; 
      }

      if (!newScores[flagId][mode]) newScores[flagId][mode] = { correct: 0, wrong: 0 };
      
      if (isCorrect) newScores[flagId][mode].correct += 1;
      else newScores[flagId][mode].wrong += 1;

      localStorage.setItem('flag_quiz_scores', JSON.stringify(newScores));
      return newScores;
    });
  };

  const handleAnswer = (isCorrect, flag, userAnswer, timeSpentMs) => {
    setTotalTime(prev => prev + timeSpentMs);
    
    const mode = settings.quizMode === 'name_to_flag' ? 'name_to_flag' : settings.type;
    updateGlobalScore(flag.id, isCorrect, mode);
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setMistakes(prev => [...prev, {
        flag,
        userAnswer,
        correctAnswer: lang === 'jp' ? flag.name_jp : flag.name_en
      }]);
    }

    if (currentQuestionIndex + 1 < quizData.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setScreen('result');
    }
  };

  const restart = () => {
    setScreen('settings');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: '#fff' }}>
        <h1 className="title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          {lang === 'jp' ? '国旗データを読み込み中...' : 'Downloading flags...'}
        </h1>
        <div style={{ width: '80%', maxWidth: '400px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', height: '20px', overflow: 'hidden' }}>
          <div style={{ width: `${(loadedCount / flagsData.length) * 100}%`, background: '#ffcd00', height: '100%', transition: 'width 0.2s' }} />
        </div>
        <p style={{ marginTop: '1rem', opacity: 0.8 }}>{loadedCount} / {flagsData.length}</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
        <LanguageToggle lang={lang} setLang={setLang} />
        {screen === 'settings' && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', width: 'auto', minWidth: '140px' }}
            onClick={() => setScreen('list')}
          >
            {lang === 'jp' ? '国/地域リスト' : 'Country List'}
          </button>
        )}
      </div>


      {screen === 'settings' && (
        <SettingsScreen
          lang={lang}
          settings={settings}
          setSettings={setSettings}
          onStart={startQuiz}
        />
      )}

      {screen === 'list' && (
        <CountryListScreen
          lang={lang}
          flags={flagsData}
          scores={globalScores}
          onBack={() => setScreen('settings')}
          onStart={startQuiz}
        />
      )}

      {screen === 'quiz' && (
        <QuizScreen
          lang={lang}
          flag={quizData[currentQuestionIndex]}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={quizData.length}
          settings={settings}
          onAnswer={handleAnswer}
          onCancel={() => setScreen('settings')}
          allFlags={quizData}
          accumulatedTime={totalTime}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          lang={lang}
          score={score}
          total={quizData.length}
          mistakes={mistakes}
          totalTime={totalTime}
          onRestart={restart}
        />
      )}
    </>
  );
}

export default App;
