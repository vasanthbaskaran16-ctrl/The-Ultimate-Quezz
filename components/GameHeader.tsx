
import React from 'react';
import { GameMode } from '../types';

interface GameHeaderProps {
  score: number;
  lives: number;
  streak: number;
  mode: GameMode;
  currentIndex: number;
  total: number;
  timer: number;
  maxTime: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  lives,
  streak,
  mode,
  currentIndex,
  total,
  timer,
  maxTime
}) => {
  const progress = ((currentIndex) / total) * 100;
  const timeProgress = (timer / maxTime) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <i className="fas fa-trophy text-yellow-400"></i>
            <span className="font-bold text-xl">{score}</span>
          </div>
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <i className="fas fa-fire text-orange-500"></i>
            <span className="font-bold text-xl">{streak}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 mb-1">{mode} Mode</span>
            <span className="text-lg font-semibold">{currentIndex + 1} / {total}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <i className="fas fa-heart text-red-500"></i>
            <span className="font-bold text-xl">{lives}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-indigo-500 progress-bar-fill shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timer Bar */}
      {mode !== GameMode.PRACTICE && (
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div 
            className={`h-full progress-bar-fill ${timer < 5 ? 'bg-red-500' : 'bg-emerald-400'}`}
            style={{ width: `${timeProgress}%` }}
            />
        </div>
      )}
    </div>
  );
};

export default GameHeader;
