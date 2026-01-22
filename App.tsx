
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, 
  INITIAL_STATE, 
  GameMode, 
  Category, 
  Difficulty, 
  Question 
} from './types';
import { generateQuestions } from './geminiService';
import GameHeader from './components/GameHeader';
import QuestionCard from './components/QuestionCard';
import Lifelines from './components/Lifelines';
import ResultsScreen from './components/ResultsScreen';

const MAX_QUESTION_TIME = 32;

// Synthesized Audio Engine
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freqs: number[], type: OscillatorType, duration: number, volume = 0.1) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(freqs[0], now);
  if (freqs.length > 1) {
    osc.frequency.exponentialRampToValueAtTime(freqs[1], now + duration);
  }
  
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  osc.start(now);
  osc.stop(now + duration);
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [timeLeft, setTimeLeft] = useState(MAX_QUESTION_TIME);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [fiftyFiftyOptions, setFiftyFiftyOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);
  
  const timerRef = useRef<any>(null);

  const playSound = (type: 'correct' | 'wrong' | 'click' | 'gameover') => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    switch (type) {
      case 'correct':
        // High rising chime
        playTone([523.25, 1046.50], 'sine', 0.3, 0.1);
        break;
      case 'wrong':
        // Low falling buzz
        playTone([220, 110], 'sawtooth', 0.4, 0.05);
        break;
      case 'click':
        playTone([800], 'sine', 0.05, 0.05);
        break;
      case 'gameover':
        playTone([440, 110], 'triangle', 0.8, 0.1);
        break;
    }
  };

  const handleStartGame = async () => {
    playSound('click');
    setIsLoading(true);
    setState(prev => ({ ...prev, currentScreen: 'LOADING' }));
    
    try {
      const qs = await generateQuestions(state.categories, state.difficulty);
      if (qs.length === 0) throw new Error("No questions generated");
      
      setState(prev => ({
        ...prev,
        questions: qs,
        currentScreen: 'GAME',
        startTime: Date.now() / 1000,
        lives: prev.mode === GameMode.SURVIVAL ? 1 : 3
      }));
      resetTimer();
    } catch (err) {
      alert("Error generating questions. Please try again.");
      setState(prev => ({ ...prev, currentScreen: 'HOME' }));
    } finally {
      setIsLoading(false);
    }
  };

  const resetTimer = useCallback(() => {
    setTimeLeft(MAX_QUESTION_TIME);
    setIsTimeFrozen(false);
  }, []);

  useEffect(() => {
    if (state.currentScreen === 'GAME' && !isAnswering && !isTimeFrozen && state.mode !== GameMode.PRACTICE) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            handleAnswer(""); // Timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.currentScreen, isAnswering, isTimeFrozen, state.mode]);

  const handleAnswer = (answer: string) => {
    if (isAnswering) return;
    
    setIsAnswering(true);
    setSelectedAnswer(answer);
    
    const currentQ = state.questions[state.currentQuestionIndex];
    const isCorrect = answer === currentQ.correctAnswer;
    setCorrectAnswer(currentQ.correctAnswer);

    if (isCorrect) {
      playSound('correct');
      const timeBonus = state.mode === GameMode.TIMED ? Math.round(timeLeft) : 0;
      const streakBonus = state.streak > 2 ? state.streak * 5 : 0;
      const basePoints = state.difficulty === Difficulty.HARD ? 30 : state.difficulty === Difficulty.MEDIUM ? 20 : 10;
      
      setState(prev => {
        const newScore = prev.score + basePoints + timeBonus + streakBonus;
        const newStreak = prev.streak + 1;
        return {
          ...prev,
          score: newScore,
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          history: [...prev.history, { 
            questionId: currentQ.id, 
            wasCorrect: true, 
            timeTaken: MAX_QUESTION_TIME - timeLeft 
          }]
        };
      });
    } else {
      playSound('wrong');
      setState(prev => {
        const newLives = prev.lives - 1;
        return {
          ...prev,
          lives: newLives,
          streak: 0,
          history: [...prev.history, { 
            questionId: currentQ.id, 
            wasCorrect: false, 
            timeTaken: MAX_QUESTION_TIME - timeLeft 
          }]
        };
      });
    }

    setTimeout(() => {
      if (state.lives <= 0 && !isCorrect && state.mode !== GameMode.PRACTICE) {
        playSound('gameover');
        endGame();
      } else if (state.currentQuestionIndex >= state.questions.length - 1) {
        endGame();
      } else {
        nextQuestion();
      }
    }, 3000);
  };

  const nextQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
    setIsAnswering(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setActiveHint(null);
    setFiftyFiftyOptions([]);
    resetTimer();
  };

  const endGame = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'RESULTS',
      totalTimeTaken: (Date.now() / 1000) - prev.startTime
    }));
  };

  const useLifeline = (type: 'fiftyFifty' | 'skip' | 'timeFreeze' | 'hint') => {
    if (state.lifelines[type] <= 0 || isAnswering) return;
    playSound('click');

    setState(prev => ({
      ...prev,
      lifelines: { ...prev.lifelines, [type]: prev.lifelines[type] - 1 }
    }));

    const currentQ = state.questions[state.currentQuestionIndex];

    switch (type) {
      case 'fiftyFifty':
        if (currentQ.type === 'multiple-choice' && currentQ.options) {
          const wrong = currentQ.options.filter(o => o !== currentQ.correctAnswer);
          const shuffledWrong = wrong.sort(() => Math.random() - 0.5).slice(0, 1);
          setFiftyFiftyOptions([currentQ.correctAnswer, ...shuffledWrong]);
        }
        break;
      case 'skip':
        nextQuestion();
        break;
      case 'timeFreeze':
        setIsTimeFrozen(true);
        break;
      case 'hint':
        setActiveHint(currentQ.hint);
        break;
    }
  };

  const toggleCategory = (cat: Category) => {
    playSound('click');
    setState(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.length > 1 ? prev.categories.filter(c => c !== cat) : prev.categories
        : [...prev.categories, cat]
    }));
  };

  const renderHome = () => (
    <div className="max-w-2xl w-full mx-auto space-y-10 animate-in fade-in duration-700 text-center">
      <div>
        <h1 className="font-branding text-7xl font-black mb-4 tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          OMNIQUIZ
        </h1>
        <p className="text-xl text-slate-400 font-medium tracking-tight">The Ultimate AI-Powered Knowledge Challenge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="glass p-6 rounded-3xl space-y-4">
           <h3 className="font-bold text-lg text-indigo-300 uppercase tracking-widest flex items-center gap-2">
             <i className="fas fa-gamepad"></i> Game Mode
           </h3>
           <div className="flex flex-wrap gap-2">
             {Object.values(GameMode).map(mode => (
               <button
                 key={mode}
                 onClick={() => { playSound('click'); setState(prev => ({ ...prev, mode })); }}
                 className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${state.mode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                 {mode}
               </button>
             ))}
           </div>
        </div>

        <div className="glass p-6 rounded-3xl space-y-4">
           <h3 className="font-bold text-lg text-emerald-300 uppercase tracking-widest flex items-center gap-2">
             <i className="fas fa-signal"></i> Difficulty
           </h3>
           <div className="flex flex-wrap gap-2">
             {Object.values(Difficulty).map(diff => (
               <button
                 key={diff}
                 onClick={() => { playSound('click'); setState(prev => ({ ...prev, difficulty: diff })); }}
                 className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${state.difficulty === diff ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                 {diff}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl text-left">
        <h3 className="font-bold text-lg text-amber-300 uppercase tracking-widest mb-4 flex items-center gap-2">
             <i className="fas fa-layer-group"></i> Choose Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
           {Object.values(Category).map(cat => (
             <button
               key={cat}
               onClick={() => toggleCategory(cat)}
               className={`px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${state.categories.includes(cat) ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:border-slate-500'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      <button
        onClick={handleStartGame}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-3xl font-black text-2xl transition-all shadow-xl hover:shadow-indigo-500/30 group relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center gap-4 tracking-tighter">
          START EXPEDITION
          <i className="fas fa-rocket group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">Powered by Gemini AI Technology</p>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
      <div className="relative">
         <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
         <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-brain text-indigo-400 animate-pulse"></i>
         </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold animate-pulse font-branding">GENERATING KNOWLEDGE BASE</h2>
        <p className="text-slate-400 italic font-medium">"The only true wisdom is in knowing you know nothing." – Socrates</p>
      </div>
    </div>
  );

  const renderGame = () => {
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return null;

    return (
      <div className="max-w-3xl w-full mx-auto pb-20">
        <GameHeader 
          score={state.score}
          lives={state.lives}
          streak={state.streak}
          mode={state.mode}
          currentIndex={state.currentQuestionIndex}
          total={state.questions.length}
          timer={timeLeft}
          maxTime={MAX_QUESTION_TIME}
        />

        <div className="space-y-8">
            <QuestionCard 
              question={currentQ}
              onAnswer={handleAnswer}
              disabled={isAnswering}
              correctAnswer={correctAnswer}
              selectedAnswer={selectedAnswer}
              fiftyFiftyOptions={fiftyFiftyOptions}
            />

            {activeHint && (
               <div className="glass p-4 rounded-2xl border-yellow-500/30 flex gap-3 animate-in fade-in slide-in-from-top-2">
                 <i className="fas fa-magic text-yellow-400 mt-1"></i>
                 <p className="text-yellow-100 text-sm italic">{activeHint}</p>
               </div>
            )}

            {!isAnswering && (
              <Lifelines 
                counts={state.lifelines}
                onUse={useLifeline}
                disabled={isAnswering}
              />
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500 selection:text-white p-4 md:p-8">
      <main className="container mx-auto max-w-5xl">
        {state.currentScreen === 'HOME' && renderHome()}
        {state.currentScreen === 'LOADING' && renderLoading()}
        {state.currentScreen === 'GAME' && renderGame()}
        {state.currentScreen === 'RESULTS' && (
          <ResultsScreen state={state} onRestart={() => setState(INITIAL_STATE)} />
        )}
      </main>

      {state.currentScreen === 'HOME' && (
        <footer className="fixed bottom-8 left-0 w-full text-center text-slate-600 text-[10px] font-bold tracking-[0.4em] pointer-events-none font-branding uppercase">
           OMNIQUIZ &copy; 2024 • THE NEXT GEN OF LEARNING
        </footer>
      )}
    </div>
  );
};

export default App;
