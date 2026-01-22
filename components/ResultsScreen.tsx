
import React from 'react';
import { GameState } from '../types';

interface ResultsScreenProps {
  state: GameState;
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ state, onRestart }) => {
  const accuracy = state.history.length > 0 
    ? Math.round((state.history.filter(h => h.wasCorrect).length / state.history.length) * 100) 
    : 0;

  return (
    <div className="max-w-md w-full mx-auto space-y-8 animate-in zoom-in duration-500">
      <div className="text-center">
        <div className="inline-block p-6 rounded-full bg-indigo-500/20 border-2 border-indigo-500 mb-6">
          <i className="fas fa-crown text-5xl text-yellow-400 drop-shadow-lg"></i>
        </div>
        <h1 className="text-4xl font-extrabold mb-2">Quiz Complete!</h1>
        <p className="text-slate-400">You've mastered the challenge.</p>
      </div>

      <div className="glass p-8 rounded-3xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
            <p className="text-3xl font-black text-white">{state.score}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Best Streak</p>
            <p className="text-3xl font-black text-orange-500">{state.bestStreak}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Accuracy</p>
            <p className="text-3xl font-black text-emerald-400">{accuracy}%</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Time</p>
            <p className="text-3xl font-black text-cyan-400">{Math.round(state.totalTimeTaken)}s</p>
          </div>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-300">
                <span>Questions Answered</span>
                <span className="font-bold">{state.history.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-300">
                <span>Correct Answers</span>
                <span className="font-bold text-emerald-400">{state.history.filter(h => h.wasCorrect).length}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-300">
                <span>Rank Achieved</span>
                <span className="font-bold text-indigo-400">
                    {accuracy > 90 ? 'Omni Scientist' : accuracy > 70 ? 'Expert' : accuracy > 50 ? 'Scholar' : 'Novice'}
                </span>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={onRestart}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-3"
        >
          <i className="fas fa-redo"></i>
          Play Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full glass py-4 rounded-2xl font-semibold text-slate-300 transition-all hover:bg-slate-700/50"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
