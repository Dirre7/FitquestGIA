import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Trophy, Activity, User, BarChart2, Home, Lock, CheckCircle, Play, 
  Zap, Dumbbell, Clock, ChevronRight, Sun, Moon, Cloud, X, Star, 
  Maximize2, Medal, Award, Calendar, Repeat, Flame, RefreshCw, Trash2,
  Hash, Timer, TrendingUp, TrendingDown, LogOut, Loader2, Sparkles, MessageSquare, Bot,
  Camera, Image as ImageIcon, Info, Filter, ArrowLeft, Check, Pause, SkipForward, Plus,
  Scale, Ruler, CalendarDays, Calculator, LayoutGrid, ChevronLeft, MoreHorizontal, Settings, MapPin, Minus, AlertTriangle
} from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { getAiCoachAdvice } from './services/geminiService';
import { AuthView } from './components/AuthView';
import { WelcomeView } from './components/WelcomeView';
import { INITIAL_USER_STATE, PROGRAMS, ACHIEVEMENTS } from './constants';
import { UserState, Program, ViewState, ActiveExerciseState, WorkoutLog, ActiveProgramProgress, SetLog, Difficulty, LocationType } from './types';

// --- Shared Components ---

const ProgressBar = ({ current, max, colorClass = "bg-primary-500" }: { current: number, max: number, colorClass?: string }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

// Componente inteligente que maneja errores de carga de imágenes
const ImageWithFallback = ({ src, alt, className, fallbackText }: { src: string, alt: string, className?: string, fallbackText?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      setImgSrc(`https://placehold.co/600x400/f1f5f9/475569?text=${encodeURIComponent(fallbackText || alt)}`);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden bg-transparent ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700 z-10">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      )}
      <img 
        src={imgSrc} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Abandonar" }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void, confirmText?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 animate-bounce-in relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <AlertTriangle className="w-24 h-24" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white relative z-10">{title}</h3>
        <p className="text-slate-500 dark:text-slate-300 mb-6 text-sm relative z-10">{message}</p>
        <div className="flex gap-3 relative z-10">
          <button onClick={onCancel} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const LevelUpModal = ({ level, onClose }: { level: number, onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden animate-bounce-in border-4 border-yellow-400">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/20 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="mx-auto w-24 h-24 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <Trophy className="w-12 h-12 text-yellow-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">¡NIVEL SUBIDO!</h2>
        <p className="text-slate-500 dark:text-slate-300 mb-6">Has alcanzado el nivel <span className="text-2xl font-bold text-primary-500">{level}</span></p>
        <p className="text-sm text-slate-400 mb-6">¡Nuevas rutinas y recompensas desbloqueadas!</p>
        <button 
          onClick={onClose}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all active:scale-95"
        >
          ¡A SEGUIR!
        </button>
      </div>
    </div>
    <Confetti />
  </div>
);

const WorkoutCompleteModal = ({ log, isProgramFinish, isWeekFinish, onClose }: { log: WorkoutLog, isProgramFinish: boolean, isWeekFinish: boolean, onClose: () => void }) => {
  let title = "¡MISIÓN CUMPLIDA!";
  let Icon = CheckCircle;
  
  if (isProgramFinish) {
    title = "¡PROGRAMA COMPLETADO!";
    Icon = Trophy;
  } else if (isWeekFinish) {
    title = "¡SEMANA COMPLETADA!";
    Icon = Medal;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden animate-bounce-in">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/40 animate-pulse">
            <Icon className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-1 leading-tight">{title}</h2>
          <p className="text-slate-400 text-sm mb-8 uppercase tracking-widest font-bold">{log.dayTitle}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-bold uppercase mb-1">XP Ganada</span>
                <span className="text-2xl font-black text-yellow-400 flex items-center gap-1">
                   <Zap className="w-4 h-4 fill-current" /> +{log.xpEarned}
                </span>
             </div>
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-bold uppercase mb-1">Tiempo</span>
                <span className="text-2xl font-black text-white">{log.durationMinutes}m</span>
             </div>
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-bold uppercase mb-1">Volumen</span>
                <span className="text-2xl font-black text-blue-400">{log.totalVolume}kg</span>
             </div>
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                <span className="text-xs text-slate-500 font-bold uppercase mb-1">Calorías</span>
                <span className="text-2xl font-black text-orange-400">{log.kcalBurned}</span>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95 text-lg"
          >
            CONTINUAR AVENTURA
          </button>
        </div>
      </div>
      <Confetti />
    </div>
  );
};

const AvatarSelectionModal = ({ isOpen, onClose, onSelect, currentLevel, currentAvatar }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void, currentLevel: number, currentAvatar: string }) => {
  const [customUrl, setCustomUrl] = useState('');
  
  // Base config for DiceBear
  const bgColors = 'b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc';

  // Defines avatar groups with unlock levels
  const avatarGroups = useMemo(() => [
    {
      title: 'Iniciados (Nivel 1)',
      minLevel: 1,
      style: 'miniavs', // Simple & Cute
      seeds: ['Lucy', 'Bob', 'Alice', 'John', 'Molly', 'Pete', 'Zoe', 'Max', 'Sam', 'Mia', 'Leo', 'Ivy', 'Ben', 'Nora', 'Tom', 'Ava']
    },
    {
      title: 'Fitness Moderno (Nivel 5)',
      minLevel: 5,
      style: 'micah', // Artistic, sleek
      seeds: ['Aidan', 'Brianna', 'Caden', 'Destiny', 'Ethan', 'Faith', 'Gabriel', 'Hope', 'Isaac', 'Jade', 'Kyle', 'Lily', 'Mason', 'Nora', 'Oliver', 'Paige']
    },
    {
      title: 'Cross-Training (Nivel 10)',
      minLevel: 10,
      style: 'avataaars', // Customizable, diverse
      seeds: ['Jack', 'Jill', 'Mike', 'Sara', 'Chris', 'Pat', 'Alex', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery', 'Parker']
    },
    {
      title: 'Guerreros RPG (Nivel 20)',
      minLevel: 20,
      style: 'adventurer', // Classic RPG look
      seeds: ['Leo', 'Willow', 'Sheba', 'Cuddles', 'Cookie', 'Sugar', 'Ginger', 'Pepper', 'King', 'Queen', 'Prince', 'Princess', 'Knight', 'Wizard', 'Rogue', 'Paladin']
    },
    {
      title: 'Cyborgs (Nivel 30)',
      minLevel: 30,
      style: 'bottts', // Robots/Machines
      seeds: ['C3PO', 'R2D2', 'WallE', 'Eve', 'Bender', 'Tron', 'Data', 'Cyber', 'Glitch', 'Spark', 'Chip', 'Byte', 'Mega', 'Giga', 'Tera', 'Peta']
    },
    {
      title: 'Leyendas Divinas (Nivel 50)',
      minLevel: 50,
      style: 'lorelei', // Epic/Godlike
      seeds: ['Zeus', 'Hera', 'Thor', 'Odin', 'Freya', 'Apollo', 'Athena', 'Ares', 'Mars', 'Venus', 'Jupiter', 'Diana', 'Hercules', 'Achilles', 'Perseus', 'Orion']
    }
  ], []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-0 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 animate-bounce-in flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white">Galería de Avatares</h3>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Tu Nivel Actual: <span className="text-primary-500 text-sm">{currentLevel}</span></p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-slate-50 dark:bg-slate-950/50">
          {avatarGroups.map((group) => {
             const isGroupLocked = currentLevel < group.minLevel;
             
             return (
               <div key={group.title} className="mb-8 last:mb-0">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${isGroupLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {isGroupLocked ? <Lock className="w-4 h-4" /> : <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                        {group.title}
                     </h4>
                     {isGroupLocked && (
                        <span className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                           Desbloquea en Nivel {group.minLevel}
                        </span>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {group.seeds.map(seed => {
                      const url = `https://api.dicebear.com/7.x/${group.style}/svg?seed=${seed}&backgroundColor=${bgColors}`;
                      const isSelected = currentAvatar === url;
                      
                      return (
                        <div key={seed} className="relative aspect-square">
                           <button 
                              onClick={() => {
                                 if (!isGroupLocked) {
                                    onSelect(url); 
                                    onClose();
                                 }
                              }}
                              disabled={isGroupLocked}
                              className={`w-full h-full rounded-2xl overflow-hidden border-2 transition-all relative group ${
                                 isSelected 
                                 ? 'border-primary-500 ring-4 ring-primary-500/20 scale-105 z-10' 
                                 : isGroupLocked
                                    ? 'border-transparent opacity-40 grayscale cursor-not-allowed bg-slate-200 dark:bg-slate-800'
                                    : 'border-transparent hover:border-primary-400 hover:scale-110 hover:shadow-lg bg-white dark:bg-slate-800 shadow-sm cursor-pointer'
                              }`}
                           >
                              <ImageWithFallback src={url} alt={seed} className="w-full h-full object-cover" />
                              
                              {/* Selected Checkmark */}
                              {isSelected && (
                                 <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                    <div className="bg-primary-500 text-white p-1 rounded-full shadow-lg">
                                       <Check className="w-4 h-4" />
                                    </div>
                                 </div>
                              )}
                           </button>
                           
                           {/* Lock Overlay for individual items (if group is locked) */}
                           {isGroupLocked && (
                              <div className="absolute -top-1 -right-1 z-20">
                                 <div className="bg-slate-600 text-white p-1 rounded-full shadow-md border border-slate-500">
                                    <Lock className="w-3 h-3" />
                                 </div>
                              </div>
                           )}
                        </div>
                      );
                    })}
                  </div>
               </div>
             );
          })}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <ImageIcon className="w-4 h-4" /> Personalizado
            </h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full pl-3 pr-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors text-slate-900 dark:text-white font-medium"
                />
              </div>
              <button 
                onClick={() => { if(customUrl) { onSelect(customUrl); onClose(); } }}
                disabled={!customUrl}
                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-colors"
              >
                Usar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Views ---

const ExerciseLoggerModal = ({ exercise, onSave, onClose }: { exercise: ActiveExerciseState, onSave: (sets: SetLog[]) => void, onClose: () => void }) => {
  const [sets, setSets] = useState<SetLog[]>(exercise.setsLog);
  const [restTimer, setRestTimer] = useState<number | null>(null);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const updateSet = (index: number, field: keyof SetLog, value: any) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        setNumber: sets.length + 1,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 0, // Optionally could clear reps or keep them
        completed: false
      }
    ]);
  };

  const removeSet = (index: number) => {
    // Re-index sets
    const newSets = sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 }));
    setSets(newSets);
  };

  const toggleComplete = (index: number) => {
    const newSets = [...sets];
    const wasCompleted = newSets[index].completed;
    newSets[index].completed = !wasCompleted;
    setSets(newSets);

    // If marking as complete and it's NOT the very last set (though some people rest after last set too, usually between exercises is handled by user flow)
    // AND there is a rest time defined:
    if (!wasCompleted && exercise.restSeconds > 0) {
       setRestTimer(exercise.restSeconds);
    }
  };

  const handleSave = () => {
    onSave(sets);
  };

  const formatRestTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
       <div className="bg-slate-900 w-full max-w-lg sm:rounded-3xl rounded-t-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
          
          {/* REST TIMER OVERLAY */}
          {restTimer !== null && (
            <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center animate-fade-in text-center p-6">
              <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-6 animate-pulse">Descanso</h3>
              
              <div className="relative mb-8">
                 <div className="text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
                    {formatRestTime(restTimer)}
                 </div>
                 <Zap className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-bounce" fill="currentColor"/>
              </div>

              <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden mb-8 border border-slate-700">
                 <div 
                   className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-1000 ease-linear" 
                   style={{width: `${(restTimer / exercise.restSeconds) * 100}%`}}
                 ></div>
              </div>

              <button 
                onClick={() => setRestTimer(null)} 
                className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all active:scale-95 border border-slate-700 flex items-center gap-2 group"
              >
                 <SkipForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 Saltar Descanso
              </button>

              <p className="absolute bottom-8 text-xs text-slate-500 font-bold">
                 Respira profundo... recupérate.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
             <div className="flex items-center gap-3">
                <div className="flex flex-col">
                   <h3 className="text-white font-bold text-lg">{exercise.name}</h3>
                   <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{exercise.targetSets} Series Meta</span>
                      {exercise.restSeconds > 0 && (
                        <span className="flex items-center gap-1 text-primary-400">
                           <Clock className="w-3 h-3" /> {exercise.restSeconds}s
                        </span>
                      )}
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
             {/* Technique Tip */}
             <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-200">{exercise.description}</p>
             </div>

             {/* Sets Header */}
             <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 uppercase text-center mb-1">
                <div className="col-span-2">Set</div>
                <div className="col-span-3">kg</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2">Done</div>
                <div className="col-span-2"></div>
             </div>

             {/* Sets Rows */}
             {sets.map((set, i) => (
                <div key={i} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-colors ${set.completed ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                   <div className="col-span-2 text-center font-bold text-slate-400">#{set.setNumber}</div>
                   <div className="col-span-3">
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        placeholder="0"
                        onChange={(e) => updateSet(i, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 text-center text-white font-bold focus:border-primary-500 focus:outline-none"
                      />
                   </div>
                   <div className="col-span-3">
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        placeholder="0"
                        onChange={(e) => updateSet(i, 'reps', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 text-center text-white font-bold focus:border-primary-500 focus:outline-none"
                      />
                   </div>
                   <div className="col-span-2 flex justify-center">
                      <button 
                        onClick={() => toggleComplete(i)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-700 text-slate-500 hover:bg-slate-600'}`}
                      >
                         <Check className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="col-span-2 flex justify-center">
                      <button 
                        onClick={() => removeSet(i)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-slate-700 transition-colors"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             ))}

             {/* Add Set Button */}
             <button 
               onClick={addSet}
               className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border-dashed active:scale-95"
             >
               <Plus className="w-4 h-4" /> Añadir Serie
             </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
             <button 
               onClick={handleSave}
               className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
             >
               Guardar Series
             </button>
          </div>
       </div>
    </div>
  );
};

const ProgramsView = ({ user, startProgram, continueProgram, abandonProgram, filter, setFilter }: { user: UserState, startProgram: (p: Program) => void, continueProgram: () => void, abandonProgram: () => void, filter: 'ALL' | Difficulty, setFilter: (f: 'ALL' | Difficulty) => void }) => {
  const filteredPrograms = PROGRAMS.filter(p => filter === 'ALL' || p.difficulty === filter);
  const activeProgram = user.activeProgram ? PROGRAMS.find(p => p.id === user.activeProgram!.programId) : null;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Entrenamiento</h2>
       </div>

       {/* Active Program Banner */}
       {activeProgram && (
         <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl shadow-primary-900/20 border border-slate-800 p-6">
            <div className="absolute top-0 right-0 p-4">
               <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">En Curso</span>
            </div>
            <h3 className="text-2xl font-black italic mb-2">{activeProgram.title}</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-[80%]">
               Día {user.activeProgram!.currentDayIndex + 1} de {activeProgram.schedule.length}
            </p>
            
            <div className="flex gap-3">
               <button onClick={continueProgram} className="flex-1 bg-primary-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary-400 transition-colors flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" /> Continuar
               </button>
               <button onClick={abandonProgram} className="px-4 py-3 bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl font-bold border border-slate-700 transition-colors">
                  <Trash2 className="w-5 h-5" />
               </button>
            </div>
         </div>
       )}

       {/* Filters */}
       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED, Difficulty.CHALLENGE].map((f) => (
             <button 
               key={f}
               onClick={() => setFilter(f as any)}
               className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filter === f 
                  ? f === Difficulty.CHALLENGE ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                  : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
               }`}
             >
                {f === 'ALL' ? 'Todos' : f}
             </button>
          ))}
       </div>

       {/* Programs Grid */}
       <div className="space-y-4">
          {filteredPrograms.map(program => {
             const isCompleted = user.completedProgramIds.includes(program.id);
             const isActive = user.activeProgram?.programId === program.id;
             const isChallenge = program.difficulty === Difficulty.CHALLENGE;
             
             return (
               <div key={program.id} className={`glass-card p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] ${isActive ? 'border-primary-500 ring-2 ring-primary-500/20' : isChallenge ? 'border-red-500/30 bg-red-500/5' : 'border-transparent'}`}>
                  <div className="flex justify-between items-start mb-3">
                     <div>
                        {isCompleted && <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full mb-2 inline-block">COMPLETADO</span>}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{program.title}</h3>
                        <div className="flex gap-2 mt-1">
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              program.difficulty === Difficulty.BEGINNER ? 'border-green-500 text-green-600' :
                              program.difficulty === Difficulty.INTERMEDIATE ? 'border-orange-500 text-orange-600' :
                              program.difficulty === Difficulty.ADVANCED ? 'border-red-500 text-red-600' :
                              'border-red-600 text-red-100 bg-red-600'
                           }`}>
                              {program.difficulty}
                           </span>
                           <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {program.location}
                           </span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className={`block text-xl font-black ${isChallenge ? 'text-red-500' : 'text-primary-500'}`}>{program.daysPerWeek}d/sem</span>
                        <span className="text-xs text-slate-400">{program.durationWeeks} semanas</span>
                     </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{program.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Recompensa Final</span>
                        <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                           <Trophy className="w-4 h-4" /> {program.xpRewardFinish} XP
                        </span>
                     </div>
                     
                     {!isActive && (
                        <button 
                           onClick={() => startProgram(program)}
                           disabled={!!user.activeProgram}
                           className={`px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity ${isChallenge ? 'bg-red-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                        >
                           {user.activeProgram ? 'En curso otro' : 'Aceptar Desafío'}
                        </button>
                     )}
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};

const AchievementsView = ({ user }: { user: UserState }) => {
   const unlockedCount = user.achievements.length;
   const totalCount = ACHIEVEMENTS.length;

   // Sorting logic: Unlocked first
   const sortedAchievements = useMemo(() => {
     return [...ACHIEVEMENTS].sort((a, b) => {
       const isA = user.achievements.includes(a.id);
       const isB = user.achievements.includes(b.id);
       return (isA === isB) ? 0 : isA ? -1 : 1;
     });
   }, [user.achievements]);

   return (
      <div className="space-y-6 pb-24 animate-fade-in">
         {/* Sticky Header */}
         <div className="bg-slate-900/90 sticky top-0 z-30 py-4 -mx-4 px-4 border-b border-slate-800/50 backdrop-blur-md">
            <div className="flex items-end justify-between mb-2">
               <h2 className="text-2xl font-black text-white">Sala de Trofeos</h2>
               <span className="text-primary-400 font-bold text-sm">{unlockedCount} / {totalCount}</span>
            </div>
            <ProgressBar current={unlockedCount} max={totalCount} colorClass="bg-gradient-to-r from-yellow-400 to-orange-500" />
         </div>

         {/* Grid */}
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedAchievements.map(ach => {
               const isUnlocked = user.achievements.includes(ach.id);
               return (
                  <div key={ach.id} className={`relative group overflow-hidden rounded-2xl border-2 p-4 flex flex-col items-center text-center transition-all duration-300 ${
                     isUnlocked
                     ? 'bg-slate-800 border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                     : 'bg-slate-900 border-slate-800 opacity-60 grayscale-[0.8]'
                  }`}>
                     {/* Unlocked Background Glow */}
                     {isUnlocked && <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />}

                     {/* Icon */}
                     <div className={`text-4xl mb-3 transform transition-transform group-hover:scale-110 ${isUnlocked ? 'drop-shadow-md' : 'opacity-50'}`}>
                        {ach.icon}
                     </div>

                     {/* Content */}
                     <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
                        <div>
                           <h4 className={`font-black text-sm mb-1 leading-tight ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                              {ach.name}
                           </h4>
                           <p className="text-[10px] font-medium text-slate-400 leading-snug">
                              {ach.description}
                           </p>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="mt-3 flex justify-center">
                           {isUnlocked ? (
                              <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                 <Star className="w-3 h-3 fill-current" /> Conseguido
                              </div>
                           ) : (
                              <div className="bg-slate-800 text-slate-600 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                 <Lock className="w-3 h-3" /> Bloqueado
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

const StatsView = ({ user, setUser }: { user: UserState, setUser: (u: UserState) => void }) => {
   // Generalized stats calculation for any period
   const calculatePeriodStats = useCallback((days: number) => {
      const now = new Date();
      const startOfCurrent = new Date(now);
      startOfCurrent.setDate(now.getDate() - days);
      
      const startOfPrevious = new Date(startOfCurrent);
      startOfPrevious.setDate(startOfCurrent.getDate() - days);

      let current = { volume: 0, duration: 0, kcal: 0, count: 0 };
      let previous = { volume: 0, duration: 0, kcal: 0, count: 0 };

      user.history.forEach(log => {
          const d = new Date(log.date);
          if (d >= startOfCurrent) {
              current.volume += log.totalVolume;
              current.duration += log.durationMinutes;
              current.kcal += log.kcalBurned;
              current.count += 1;
          } else if (d >= startOfPrevious && d < startOfCurrent) {
              previous.volume += log.totalVolume;
              previous.duration += log.durationMinutes;
              previous.kcal += log.kcalBurned;
              previous.count += 1;
          }
      });
      return { current, previous };
   }, [user.history]);

   const stats7 = useMemo(() => calculatePeriodStats(7), [calculatePeriodStats]);
   const stats15 = useMemo(() => calculatePeriodStats(15), [calculatePeriodStats]);
   const stats28 = useMemo(() => calculatePeriodStats(28), [calculatePeriodStats]);

   const [editingBio, setEditingBio] = useState(false);
   const [weight, setWeight] = useState(user.weight);
   const [height, setHeight] = useState(user.height);

   const saveBio = () => {
      setUser({ ...user, weight, height });
      setEditingBio(false);
   };

   const renderTrend = (curr: number, prev: number) => {
      const diff = curr - prev;
      const isUp = diff >= 0;
      const percent = prev === 0 ? (curr > 0 ? 100 : 0) : ((diff / prev) * 100);
      
      return (
          <div className={`text-xs font-bold flex items-center gap-1 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(percent).toFixed(0)}%</span>
          </div>
      );
   };

   const renderStatsBlock = (title: string, stats: { current: any, previous: any }) => (
      <div className="mb-4">
         <h3 className="font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-primary-500" /> {title}
         </h3>
         <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-3 rounded-xl flex flex-col justify-between">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Volumen</span>
               <div className="mb-1">
                  <span className="text-lg font-black text-slate-800 dark:text-white">{(stats.current.volume / 1000).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 ml-0.5">k</span>
               </div>
               {renderTrend(stats.current.volume, stats.previous.volume)}
            </div>
            <div className="glass-card p-3 rounded-xl flex flex-col justify-between">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Tiempo</span>
               <div className="mb-1">
                  <span className="text-lg font-black text-slate-800 dark:text-white">{stats.current.duration}</span>
                  <span className="text-[10px] text-slate-500 ml-0.5">min</span>
               </div>
               {renderTrend(stats.current.duration, stats.previous.duration)}
            </div>
            <div className="glass-card p-3 rounded-xl flex flex-col justify-between">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Kcal</span>
               <div className="mb-1">
                  <span className="text-lg font-black text-slate-800 dark:text-white">{stats.current.kcal}</span>
               </div>
               {renderTrend(stats.current.kcal, stats.previous.kcal)}
            </div>
         </div>
      </div>
   );

   return (
      <div className="space-y-6 pb-24 animate-fade-in">
         <h2 className="text-2xl font-black text-slate-900 dark:text-white">Estadísticas</h2>
         
         {/* Summary Grid */}
         <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 rounded-2xl">
               <div className="text-slate-400 text-xs font-bold uppercase mb-1">Volumen Total</div>
               <div className="text-2xl font-black text-blue-500">{(user.totalWeightLifted / 1000).toFixed(1)} <span className="text-sm text-slate-500">ton</span></div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
               <div className="text-slate-400 text-xs font-bold uppercase mb-1">Tiempo Total</div>
               <div className="text-2xl font-black text-indigo-500">{Math.floor(user.totalDurationMinutes / 60)} <span className="text-sm text-slate-500">h</span> {user.totalDurationMinutes % 60} <span className="text-sm text-slate-500">m</span></div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
               <div className="text-slate-400 text-xs font-bold uppercase mb-1">Calorías</div>
               <div className="text-2xl font-black text-orange-500">{(user.totalKcalBurned / 1000).toFixed(1)} <span className="text-sm text-slate-500">kCal</span></div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
               <div className="text-slate-400 text-xs font-bold uppercase mb-1">Entrenamientos</div>
               <div className="text-2xl font-black text-green-500">{user.completedWorkouts}</div>
            </div>
         </div>

         {/* Stats Blocks */}
         {renderStatsBlock("Rendimiento (7 Días)", stats7)}
         {renderStatsBlock("Rendimiento (15 Días)", stats15)}
         {renderStatsBlock("Rendimiento (28 Días)", stats28)}

         {/* Biometrics */}
         <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" /> Biometría
               </h3>
               {!editingBio ? (
                  <button onClick={() => setEditingBio(true)} className="text-xs font-bold text-primary-500">Editar</button>
               ) : (
                  <button onClick={saveBio} className="text-xs font-bold text-green-500">Guardar</button>
               )}
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Peso (kg)</label>
                  {editingBio ? (
                     <input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value))} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg w-full font-bold" />
                  ) : (
                     <span className="text-2xl font-black text-slate-800 dark:text-white">{user.weight || '--'}</span>
                  )}
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Altura (cm)</label>
                  {editingBio ? (
                     <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg w-full font-bold" />
                  ) : (
                     <span className="text-2xl font-black text-slate-800 dark:text-white">{user.height || '--'}</span>
                  )}
               </div>
            </div>
            
            {/* IMC Calculation just for fun */}
            {user.weight > 0 && user.height > 0 && (
               <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">IMC Estimado</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                     {(user.weight / ((user.height/100) ** 2)).toFixed(1)}
                  </span>
               </div>
            )}
         </div>
      </div>
   );
};

const ProfileView = ({ user, setUser, toggleTheme, signOut, onResetProgress }: { user: UserState, setUser: (u: UserState) => void, toggleTheme: () => void, signOut: () => void, onResetProgress: () => void }) => {
   const [showAvatarModal, setShowAvatarModal] = useState(false);
   const [editingName, setEditingName] = useState(false);
   const [name, setName] = useState(user.name);

   const handleNameSave = () => {
      setUser({ ...user, name });
      setEditingName(false);
   };

   return (
      <div className="space-y-6 pb-24 animate-fade-in">
         {/* Header */}
         <div className="text-center pt-4">
            <div className="relative inline-block">
               <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl mb-4 bg-slate-200">
                  <ImageWithFallback src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <button 
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-4 right-0 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
               >
                  <Camera className="w-4 h-4" />
               </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-1">
               {editingName ? (
                  <div className="flex gap-2">
                     <input 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="bg-transparent border-b border-slate-300 dark:border-slate-600 text-center font-black text-xl w-40 focus:outline-none"
                        autoFocus
                     />
                     <button onClick={handleNameSave} className="text-green-500"><Check className="w-5 h-5" /></button>
                  </div>
               ) : (
                  <>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.name}</h2>
                     <button onClick={() => setEditingName(true)} className="text-slate-400 hover:text-slate-600"><Settings className="w-4 h-4" /></button>
                  </>
               )}
            </div>
            <p className="text-primary-500 font-bold uppercase text-xs tracking-widest">Nivel {user.level}</p>
         </div>

         {/* Options */}
         <div className="space-y-3">
            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  {user.settings.darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-orange-400" />}
                  <span className="font-bold text-slate-700 dark:text-slate-200">Modo Oscuro</span>
               </div>
               <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${user.settings.darkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
               >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${user.settings.darkMode ? 'translate-x-6' : ''}`} />
               </button>
            </div>

            <button 
               onClick={signOut}
               className="w-full glass-card p-4 rounded-xl flex items-center gap-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
               <LogOut className="w-5 h-5" />
               Cerrar Sesión
            </button>

            <button 
               onClick={onResetProgress}
               className="w-full border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all text-xs uppercase tracking-widest"
            >
               <Trash2 className="w-5 h-5" />
               Reiniciar Progreso
            </button>
         </div>

         {/* History Preview */}
         <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 ml-1">Historial Reciente</h3>
            <div className="space-y-3">
               {[...user.history].reverse().slice(0, 5).map(log => (
                  <div key={log.id} className="glass-card p-4 rounded-xl flex justify-between items-center">
                     <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{log.dayTitle}</h4>
                        <p className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                        <span className="block font-bold text-green-500 text-sm">+{log.xpEarned} XP</span>
                        <span className="text-xs text-slate-400">{log.totalVolume} kg</span>
                     </div>
                  </div>
               ))}
               {user.history.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-4">Aún no hay historial.</p>
               )}
            </div>
         </div>

         {/* Avatar Modal */}
         <AvatarSelectionModal 
            isOpen={showAvatarModal}
            onClose={() => setShowAvatarModal(false)}
            onSelect={(url) => setUser({...user, avatar: url})}
            currentLevel={user.level}
            currentAvatar={user.avatar}
         />
      </div>
   );
};

const DashboardView = ({ user, setView, onGoToChallenges }: { user: UserState; setView: (v: ViewState) => void, onGoToChallenges: () => void }) => {
  const activeProgram = user.activeProgram ? PROGRAMS.find(p => p.id === user.activeProgram!.programId) : null;
  const activeProgress = user.activeProgram;
  const unlockedAchievements = ACHIEVEMENTS.filter(ach => (user.achievements || []).includes(ach.id));
  const recentUnlocked = [...unlockedAchievements].reverse().slice(0, 4);

  // AI State
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Helper para el título del rango
  const getRankTitle = (level: number) => {
    if (level >= 50) return "Leyenda Viviente";
    if (level >= 30) return "Maestro Fitness";
    if (level >= 20) return "Veterano de Hierro";
    if (level >= 10) return "Guerrero Élite";
    if (level >= 5) return "Aventurero";
    return "Novato";
  };

  const handleConsultAi = async () => {
    setAiLoading(true);
    setAiAdvice(null);
    try {
      const advice = await getAiCoachAdvice(user, "Dame un consejo breve, motivador y táctico para mi siguiente nivel basado en mis estadísticas. Sé directo.");
      setAiAdvice(advice);
    } catch (e) {
      setAiAdvice("El coach está ocupado en este momento. Intenta más tarde.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      
      {/* Profile Summary Card - Redesigned */}
      <div 
        onClick={() => setView('profile')}
        className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl p-6 border border-slate-800 group cursor-pointer hover:border-slate-700 transition-all active:scale-[0.98]"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex items-center gap-6">
          {/* Avatar & Level */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-800 shadow-xl overflow-hidden bg-slate-700 group-hover:scale-105 transition-transform duration-500">
               <ImageWithFallback src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            
            {/* Big Level Badge */}
            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white shadow-lg border-4 border-slate-900 transform rotate-6 group-hover:rotate-12 transition-transform duration-300">
               <span className="text-[8px] sm:text-[10px] font-bold uppercase leading-none opacity-80 text-amber-100 shadow-black drop-shadow-md">Lvl</span>
               <span className="text-xl sm:text-2xl font-black leading-none drop-shadow-md">{user.level}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2">
             <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-primary-400 uppercase tracking-wider shadow-sm">
                  {getRankTitle(user.level)}
                </span>
             </div>
             <h3 className="text-2xl sm:text-3xl font-black tracking-tight truncate mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 drop-shadow-sm group-hover:to-white transition-colors">
               {user.name}
             </h3>

             {/* XP Bar */}
             <div className="relative">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                   <span>XP {user.currentXP}</span>
                   <span>{user.nextLevelXP} Meta</span>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
                   {/* Striped background for empty part */}
                   <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)_100%)] bg-[length:10px_10px]"></div>
                   
                   {/* Fill */}
                   <div 
                     className="h-full bg-gradient-to-r from-primary-600 to-primary-400 shadow-[0_0_15px_rgba(20,184,166,0.6)] relative transition-all duration-1000 ease-out"
                     style={{ width: `${Math.min(100, (user.currentXP / user.nextLevelXP) * 100)}%` }}
                   >
                      <div className="absolute inset-0 bg-white/20"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Active Program Banner */}
      {activeProgram && activeProgress ? (
         <div 
          onClick={() => setView('training')}
          className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl shadow-primary-900/20 cursor-pointer group border border-slate-800"
        >
          {/* Background Gradient & Decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-slate-900 opacity-90 z-0"></div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-500 rounded-full blur-[80px] opacity-30 z-0"></div>
          
          <div className="relative z-10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-primary-300 font-bold text-xs uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Programa Activo
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic mb-3">{activeProgram.title}</h2>
              
              {/* Visual Progress Bar */}
              <div className="w-full max-w-sm">
                 <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <span>Progreso Total</span>
                    <span>{Math.round((activeProgress.currentDayIndex / activeProgram.schedule.length) * 100)}%</span>
                 </div>
                 <div className="h-3 w-full bg-slate-800/60 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur-sm relative shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-400 to-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)] transition-all duration-1000 relative" 
                      style={{ width: `${Math.max(2, ((activeProgress.currentDayIndex) / activeProgram.schedule.length) * 100)}%` }}
                    >
                       <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                 </div>
                 <p className="text-slate-300 text-xs mt-2 font-medium flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded-md font-bold">Día {activeProgress.currentDayIndex + 1}</span>
                    <span className="opacity-70">de {activeProgram.schedule.length} sesiones</span>
                 </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-xs text-slate-400 uppercase font-bold">Siguiente Sesión</div>
                <div className="font-bold">{activeProgram.schedule[activeProgress.currentDayIndex].title}</div>
              </div>
              <div className="bg-primary-500 p-3 rounded-full text-white shadow-lg shadow-primary-500/40 group-hover:scale-110 transition-transform">
                <Play fill="currentColor" className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setView('training')}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl cursor-pointer hover:scale-[1.01] transition-transform relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">¡Comienza tu Aventura!</h2>
            <p className="text-violet-100 mb-4">Selecciona un programa de entrenamiento para empezar a ganar XP.</p>
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold text-sm">
              Ver Programas <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          <Trophy className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
        </div>
      )}

      {/* Weekly Challenge Card */}
      <div 
        onClick={onGoToChallenges}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg cursor-pointer hover:shadow-orange-500/20 hover:scale-[1.01] transition-all p-5 flex items-center justify-between group"
      >
        <div>
          <h3 className="font-black text-xl italic uppercase tracking-wider mb-1">Desafíos Semanales</h3>
          <p className="text-red-100 text-sm font-medium">Prueba tu valía. Gana recompensas exclusivas.</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
          <Flame className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>

      {/* AI Coach Card */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-2 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Bot className="w-24 h-24 text-indigo-500" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" /> LevelUp Coach AI
          </h3>
          
          {!aiAdvice ? (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Analiza tus estadísticas, nivel y logros para recibir consejos tácticos personalizados.
              </p>
              <button 
                onClick={handleConsultAi}
                disabled={aiLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analizando rendimiento...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Invocar Consejo Táctico
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="animate-fade-in">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-4">
                <div className="flex gap-3">
                  <Bot className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
                  <p className="text-sm text-slate-700 dark:text-indigo-100 italic leading-relaxed">"{aiAdvice}"</p>
                </div>
              </div>
              <button 
                onClick={handleConsultAi}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 ml-auto"
              >
                <RefreshCw className="w-3 h-3" />
                Pedir otro consejo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => setView('stats')}
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/50 transition-colors"
        >
          <Dumbbell className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-xl font-bold">{(user.totalWeightLifted / 1000).toFixed(1)}k</span>
          <span className="text-xs text-slate-500">Kg Totales</span>
        </div>
        <div 
          onClick={() => setView('stats')}
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/50 transition-colors"
        >
          <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
          <span className="text-xl font-bold">{user.completedWorkouts}</span>
          <span className="text-xs text-slate-500">Sesiones</span>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-lg font-semibold">Logros Recientes</h3>
          <button onClick={() => setView('achievements')} className="text-sm text-primary-600 font-bold hover:underline">
            Ver todos ({unlockedAchievements.length})
          </button>
        </div>
        
        {recentUnlocked.length === 0 ? (
          <div className="glass-card p-6 rounded-xl text-center text-slate-400">
            <Medal className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aún no has desbloqueado logros. ¡Entrena para empezar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentUnlocked.map(ach => (
              <div key={ach.id} className="glass-card p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.01] border-l-4 border-yellow-400 bg-yellow-50/30 dark:bg-yellow-900/10">
                <div className="text-3xl shrink-0 bg-white/50 dark:bg-slate-800/50 p-2 rounded-full shadow-sm">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{ach.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{ach.description}</p>
                </div>
                <Star className="w-4 h-4 text-yellow-500 animate-spin-slow shrink-0" />
              </div>
            ))}
             <button 
              onClick={() => setView('achievements')}
              className="w-full p-3 rounded-xl flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors text-xs font-bold"
            >
              <Award className="w-4 h-4" />
              Ver Colección Completa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ActiveWorkoutView = ({ user, onUpdateUser, onFinishWorkout, onCancelWorkout }: { user: UserState, onUpdateUser: (u: UserState) => void, onFinishWorkout: () => void, onCancelWorkout: () => void }) => {
  const [activeExercise, setActiveExercise] = useState<ActiveExerciseState | null>(null);
  const [elapsed, setElapsed] = useState(user.activeProgram?.currentDayLog?.timer || 0);
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync timer logic could be added here if needed, but for now relies on finish/save actions.

  if (!user.activeProgram || !user.activeProgram.currentDayLog) return null;

  const currentLog = user.activeProgram.currentDayLog;
  const program = PROGRAMS.find(p => p.id === user.activeProgram!.programId);
  const day = program?.schedule[user.activeProgram.currentDayIndex];

  const handleExerciseSave = (sets: SetLog[]) => {
    if (!activeExercise) return;
    
    // Update exercises in currentDayLog
    const updatedExercises = currentLog.exercises.map(ex => 
       ex.id === activeExercise.id ? { ...ex, setsLog: sets, isFullyCompleted: sets.every(s => s.completed) } : ex
    );

    // Save to global user state
    onUpdateUser({
      ...user,
      activeProgram: {
        ...user.activeProgram!,
        currentDayLog: {
          timer: elapsed,
          exercises: updatedExercises
        }
      }
    });

    setActiveExercise(null);
  };

  const handleFinishAttempt = () => {
     const pending = currentLog.exercises.some(ex => !ex.isFullyCompleted);
     if (pending) {
        setShowIncompleteAlert(true);
     } else {
        onFinishWorkout();
     }
  };
  
  return (
    <div className="pb-24 animate-fade-in relative min-h-screen flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between mb-6 sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm py-2">
          <div>
             <h2 className="text-xl font-black text-slate-900 dark:text-white">{day?.title}</h2>
             <div className="flex items-center gap-2 text-slate-500 font-mono text-sm">
                <Timer className="w-4 h-4" />
                <span>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
             </div>
          </div>
          <button onClick={onCancelWorkout} className="p-2 text-slate-400 hover:text-red-500">
             <X className="w-6 h-6" />
          </button>
       </div>

       {/* Exercises List */}
       <div className="space-y-4 flex-1">
          {currentLog.exercises.map((ex) => {
             const completedSets = ex.setsLog.filter(s => s.completed).length;
             return (
                <div 
                   key={ex.id} 
                   onClick={() => setActiveExercise(ex)}
                   className={`glass-card p-4 rounded-xl flex items-center gap-4 cursor-pointer border-l-4 transition-all ${
                      ex.isFullyCompleted ? 'border-green-500 opacity-60' : 'border-primary-500 hover:scale-[1.01]'
                   }`}
                >
                   <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      <Dumbbell className="w-8 h-8 text-slate-400" />
                   </div>
                   <div className="flex-1">
                      <h4 className={`font-bold ${ex.isFullyCompleted ? 'text-green-600 line-through' : 'text-slate-900 dark:text-white'}`}>{ex.name}</h4>
                      <p className="text-xs text-slate-500">{ex.targetSets} Series × {ex.targetReps}</p>
                   </div>
                   <div className="flex flex-col items-end">
                      {ex.isFullyCompleted ? (
                         <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                         <span className="text-2xl font-black text-slate-200 dark:text-slate-700">{completedSets}/{ex.targetSets}</span>
                      )}
                   </div>
                </div>
             );
          })}
       </div>

       {/* Finish Button */}
       <div className="sticky bottom-4 mt-6">
          <button 
             onClick={handleFinishAttempt}
             className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
             <CheckCircle className="w-6 h-6" /> Finalizar Entrenamiento
          </button>
       </div>

       {/* Modal */}
       {activeExercise && (
          <ExerciseLoggerModal 
             exercise={activeExercise} 
             onSave={handleExerciseSave} 
             onClose={() => setActiveExercise(null)} 
          />
       )}

       {/* Incomplete Alert Modal */}
       {showIncompleteAlert && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden animate-bounce-in">
               <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">¡Entrenamiento Incompleto!</h3>
               <p className="text-slate-400 text-sm mb-6">
                  Aún tienes ejercicios sin marcar como completados. Por favor, registra todas las series para finalizar la sesión y obtener tu recompensa.
               </p>
               <button 
                 onClick={() => setShowIncompleteAlert(false)}
                 className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
               >
                 Entendido, volver
               </button>
            </div>
         </div>
       )}
    </div>
  );
};

const NavButton = ({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
      isActive 
        ? 'text-primary-600 dark:text-primary-400 scale-110' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
    }`}
  >
    <Icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<UserState>(INITIAL_USER_STATE);
  const [view, setView] = useState<ViewState>('dashboard');
  const [programFilter, setProgramFilter] = useState<'ALL' | Difficulty>('ALL');
  const [loading, setLoading] = useState(true);
  
  // Welcome/Onboarding State
  // Check if we've seen it before in localStorage. Initial render only.
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    // If key exists, it means we have seen it.
    return !localStorage.getItem('levelup_welcome_seen');
  });
  
  // Modals state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState<WorkoutLog | null>(null);
  const [showConfirmAbandon, setShowConfirmAbandon] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Derived state for modals
  const [newLevel, setNewLevel] = useState(0);
  const [isProgFinish, setIsProgFinish] = useState(false);
  const [isWeekFinish, setIsWeekFinish] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUser(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUser(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('state')
        .eq('user_id', uid)
        .single();

      if (data && data.state) {
        setUser(data.state);
      } else {
        // Init new user
        const newUser = { ...INITIAL_USER_STATE };
        await saveUser(newUser, uid);
        setUser(newUser);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (newState: UserState, uid?: string) => {
    const userId = uid || session?.user?.id;
    if (!userId) return;

    try {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        state: newState,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving user state", e);
    }
  };

  const handleUpdateUser = (newUser: UserState) => {
    setUser(newUser);
    saveUser(newUser);
  };
  
  const resetUser = () => {
    // Keep settings preference to avoid blinding user
    const resetState = { 
      ...INITIAL_USER_STATE,
      settings: user.settings
    };
    handleUpdateUser(resetState);
    setShowConfirmReset(false);
    setView('dashboard');
  };
  
  const handleWelcomeContinue = () => {
    localStorage.setItem('levelup_welcome_seen', 'true');
    setShowWelcome(false);
  };
  
  // Logic for leveling up
  useEffect(() => {
    if (user.currentXP >= user.nextLevelXP) {
      const leftover = user.currentXP - user.nextLevelXP;
      const nextLvl = user.level + 1;
      const nextTarget = Math.floor(user.nextLevelXP * 1.2);
      
      const leveledUser = {
        ...user,
        level: nextLvl,
        currentXP: leftover,
        nextLevelXP: nextTarget
      };
      
      handleUpdateUser(leveledUser);
      setNewLevel(nextLvl);
      setShowLevelUp(true);
    }
    
    // Check achievements
    const newUnlocked: string[] = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!user.achievements.includes(ach.id) && ach.condition(user)) {
        newUnlocked.push(ach.id);
      }
    });

    if (newUnlocked.length > 0) {
       handleUpdateUser({
         ...user,
         achievements: [...user.achievements, ...newUnlocked]
       });
    }

  }, [user.currentXP, user.totalWeightLifted, user.completedWorkouts, user.totalDurationMinutes]);


  // Program Actions
  const startProgram = (program: Program) => {
    // Init active program state
    const firstDay = program.schedule[0];
    const newActiveState: ActiveProgramProgress = {
      programId: program.id,
      currentDayIndex: 0,
      startedAt: new Date().toISOString(),
      currentDayLog: {
        timer: 0,
        exercises: firstDay.exercises.map(template => ({
          ...template,
          setsLog: Array(template.targetSets).fill(0).map((_, i) => ({
            setNumber: i + 1,
            weight: 0,
            reps: 0,
            completed: false
          })),
          isFullyCompleted: false
        }))
      }
    };

    const newUser = { ...user, activeProgram: newActiveState };
    handleUpdateUser(newUser);
    setView('active-workout');
  };

  const continueProgram = () => {
    setView('active-workout');
  };

  const abandonProgram = () => {
    setShowConfirmAbandon(true);
  };

  const confirmAbandon = () => {
    const newUser = { ...user, activeProgram: null };
    handleUpdateUser(newUser);
    setShowConfirmAbandon(false);
    setView('training');
  };

  const finishWorkout = () => {
    if (!user.activeProgram || !user.activeProgram.currentDayLog) return;
    
    const program = PROGRAMS.find(p => p.id === user.activeProgram!.programId);
    if (!program) return;

    const currentDay = program.schedule[user.activeProgram.currentDayIndex];
    const logData = user.activeProgram.currentDayLog;
    
    // Calculate stats
    let volume = 0;
    let setsDone = 0;
    let repsDone = 0;
    
    logData.exercises.forEach(ex => {
      ex.setsLog.forEach(s => {
        if (s.completed) {
          setsDone++;
          repsDone += s.reps;
          volume += (s.weight * s.reps);
        }
      });
    });

    const duration = Math.floor(logData.timer / 60);
    // Rough calorie estimation: MET * weight * hours. 
    // Lifting weights ~3-6 METs. Let's use 5. 
    // Formula: Kcal = MET * kg * hours
    const kcal = Math.floor(5 * (user.weight || 70) * (logData.timer / 3600));

    // XP Calculation
    let xp = program.xpRewardDay;
    // Bonus for volume?
    xp += Math.floor(volume / 100); 

    const newLog: WorkoutLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      programTitle: program.title,
      dayTitle: currentDay.title,
      totalVolume: volume,
      totalSets: setsDone,
      totalReps: repsDone,
      durationMinutes: duration,
      xpEarned: xp,
      kcalBurned: kcal || 0
    };

    // Update Progress
    const nextIndex = user.activeProgram.currentDayIndex + 1;
    const isFinished = nextIndex >= program.schedule.length;
    
    let updatedUser = {
      ...user,
      currentXP: user.currentXP + xp,
      completedWorkouts: user.completedWorkouts + 1,
      totalWeightLifted: user.totalWeightLifted + volume,
      totalDurationMinutes: user.totalDurationMinutes + duration,
      totalKcalBurned: (user.totalKcalBurned || 0) + (kcal || 0),
      history: [...user.history, newLog],
      activeProgram: isFinished ? null : {
        ...user.activeProgram,
        currentDayIndex: nextIndex,
        currentDayLog: {
          timer: 0,
          exercises: program.schedule[nextIndex].exercises.map(template => ({
            ...template,
            setsLog: Array(template.targetSets).fill(0).map((_, i) => ({
              setNumber: i + 1,
              weight: 0,
              reps: 0,
              completed: false
            })),
            isFullyCompleted: false
          }))
        } // Prepare next day
      }
    };

    if (isFinished) {
      updatedUser.completedProgramIds = [...updatedUser.completedProgramIds, program.id];
      updatedUser.currentXP += program.xpRewardFinish; // Bonus finish
      setIsProgFinish(true);
    } else {
       setIsProgFinish(false);
    }
    
    // Check week finish (heuristic: index % daysPerWeek == 0)
    setIsWeekFinish(!isFinished && (nextIndex % program.daysPerWeek === 0));

    handleUpdateUser(updatedUser);
    setShowWorkoutComplete(newLog);
    setView('dashboard');
  };

  const goToChallenges = () => {
    setProgramFilter(Difficulty.CHALLENGE);
    setView('training');
  };
  
  // Theme effect
  useEffect(() => {
    if (user.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.settings.darkMode]);

  // View Logic Switcher
  if (!session) {
    if (showWelcome) {
      return <WelcomeView onContinue={handleWelcomeContinue} />;
    }
    return <AuthView />;
  }

  return (
    <div className={`min-h-screen ${user.settings.darkMode ? 'dark' : ''}`}>
       <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans selection:bg-primary-500 selection:text-white pb-safe transition-colors duration-300">
          
          {loading && (
             <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
             </div>
          )}

          {/* Main Content */}
          <main className="max-w-md mx-auto min-h-screen relative p-4 pb-24">
             {view === 'dashboard' && <DashboardView user={user} setView={setView} onGoToChallenges={goToChallenges} />}
             {view === 'training' && <ProgramsView user={user} startProgram={startProgram} continueProgram={continueProgram} abandonProgram={abandonProgram} filter={programFilter} setFilter={setProgramFilter} />}
             {view === 'active-workout' && <ActiveWorkoutView user={user} onUpdateUser={handleUpdateUser} onFinishWorkout={finishWorkout} onCancelWorkout={() => setView('training')} />}
             {view === 'stats' && <StatsView user={user} setUser={handleUpdateUser} />}
             {view === 'achievements' && <AchievementsView user={user} />}
             {view === 'profile' && <ProfileView user={user} setUser={handleUpdateUser} toggleTheme={() => handleUpdateUser({...user, settings: {...user.settings, darkMode: !user.settings.darkMode}})} signOut={() => supabase.auth.signOut()} onResetProgress={() => setShowConfirmReset(true)} />}
          </main>

          {/* Bottom Nav */}
          {view !== 'active-workout' && (
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-50 liquid-glass rounded-3xl transition-all duration-300 hover:scale-[1.02]">
               <div className="flex justify-around items-center h-20 px-2">
                  <NavButton icon={Home} label="Inicio" isActive={view === 'dashboard'} onClick={() => setView('dashboard')} />
                  <NavButton icon={Dumbbell} label="Entreno" isActive={view === 'training'} onClick={() => setView('training')} />
                  <NavButton icon={BarChart2} label="Stats" isActive={view === 'stats'} onClick={() => setView('stats')} />
                  <NavButton icon={User} label="Perfil" isActive={view === 'profile'} onClick={() => setView('profile')} />
               </div>
            </nav>
          )}
          
          {/* Global Modals */}
          {showLevelUp && <LevelUpModal level={newLevel} onClose={() => setShowLevelUp(false)} />}
          {showWorkoutComplete && (
             <WorkoutCompleteModal 
               log={showWorkoutComplete} 
               isProgramFinish={isProgFinish} 
               isWeekFinish={isWeekFinish} 
               onClose={() => setShowWorkoutComplete(null)} 
             />
          )}
          <ConfirmationModal 
             isOpen={showConfirmAbandon} 
             title="¿Abandonar Programa?" 
             message="Perderás el progreso de tu sesión actual y del programa. ¿Estás seguro?" 
             onConfirm={confirmAbandon} 
             onCancel={() => setShowConfirmAbandon(false)} 
          />
           <ConfirmationModal 
             isOpen={showConfirmReset} 
             title="¿Reiniciar Progreso?" 
             message="Estás a punto de borrar todo tu historial, nivel, experiencia y logros. Volverás al Nivel 1. Esta acción no se puede deshacer." 
             onConfirm={resetUser} 
             onCancel={() => setShowConfirmReset(false)}
             confirmText="Sí, borrar todo"
          />
       </div>
    </div>
  );
};

export default App;