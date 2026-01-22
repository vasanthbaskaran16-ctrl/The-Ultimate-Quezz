
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  correctAnswer?: string | null;
  selectedAnswer?: string | null;
  fiftyFiftyOptions?: string[];
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  disabled,
  correctAnswer,
  selectedAnswer,
  fiftyFiftyOptions
}) => {
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    if (question.type === 'multiple-choice' && question.options) {
      setShuffledOptions([...question.options].sort(() => Math.random() - 0.5));
    } else if (question.type === 'true-false') {
      setShuffledOptions(['True', 'False']);
    }
  }, [question]);

  const getButtonStyles = (option: string) => {
    const base = "w-full p-5 text-left rounded-2xl transition-all duration-300 flex justify-between items-center group ";
    
    if (selectedAnswer === option) {
      if (option === correctAnswer) return base + "bg-emerald-500/20 border-2 border-emerald-500 ring-4 ring-emerald-500/20";
      return base + "bg-red-500/20 border-2 border-red-500 ring-4 ring-red-500/20";
    }

    if (correctAnswer === option) {
        return base + "bg-emerald-500/20 border-2 border-emerald-500";
    }

    if (disabled) return base + "bg-slate-800/50 border-2 border-transparent opacity-50";

    return base + "bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-700/50 active:scale-[0.98]";
  };

  const isCorrectChoice = selectedAnswer === correctAnswer;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass p-8 rounded-3xl">
        <div className="mb-4">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                {question.category}
            </span>
            <span className="ml-2 px-3 py-1 bg-slate-700/50 text-slate-300 text-xs font-bold rounded-full uppercase tracking-wider">
                {question.difficulty}
            </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight">
          {question.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {shuffledOptions.map((option, idx) => {
          const isHidden = fiftyFiftyOptions && fiftyFiftyOptions.length > 0 && !fiftyFiftyOptions.includes(option);
          
          if (isHidden && !disabled) return null;

          const isThisCorrect = option === correctAnswer;
          const isThisSelected = option === selectedAnswer;

          return (
            <button
              key={idx}
              disabled={disabled || isHidden}
              onClick={() => onAnswer(option)}
              className={getButtonStyles(option)}
            >
              <span className="text-lg font-medium">{option}</span>
              <div className="flex items-center">
                {disabled && isThisCorrect && (
                  <i className="fas fa-check-circle text-emerald-500 text-xl animate-in zoom-in duration-300"></i>
                )}
                {disabled && isThisSelected && !isThisCorrect && (
                  <i className="fas fa-times-circle text-red-500 text-xl animate-in zoom-in duration-300"></i>
                )}
                {!disabled && (
                  <i className="fas fa-chevron-right text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {disabled && (
        <div className={`glass p-6 rounded-2xl border-2 animate-in zoom-in duration-300 ${isCorrectChoice ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
           <div className="flex items-start gap-3">
             <i className={`fas ${isCorrectChoice ? 'fa-check-circle text-emerald-400' : 'fa-times-circle text-red-400'} mt-1 text-xl`}></i>
             <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className={`font-bold text-sm uppercase tracking-widest ${isCorrectChoice ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedAnswer === "" ? "Time Up!" : isCorrectChoice ? "Brilliant!" : "Not Quite!"}
                  </p>
                  {!isCorrectChoice && (
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      Answer: <span className="text-emerald-400">{correctAnswer}</span>
                    </p>
                  )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{question.explanation}</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
