import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Trophy, Activity, User, BarChart2, Home, Lock, CheckCircle, Play, 
  Zap, Dumbbell, Clock, ChevronRight, Sun, Moon, Cloud, X, Star, 
  Maximize2, Medal, Award, Calendar, Repeat, Flame, RefreshCw, Trash2,
  Hash, Timer, TrendingUp, TrendingDown, LogOut, Loader2,
  Camera, Image as ImageIcon, Info, Filter, ArrowLeft, Check, Pause, SkipForward, Plus,
  Scale, Ruler, CalendarDays, Calculator, LayoutGrid, ChevronLeft, MoreHorizontal, Settings, MapPin, Minus, AlertTriangle,
  Menu
} from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { AuthView } from './components/AuthView';
import { WelcomeView } from './components/WelcomeView';
import { INITIAL_USER_STATE, PROGRAMS, ACHIEVEMENTS } from './constants';
import { UserState, Program, ViewState, ActiveExerciseState, WorkoutLog, ActiveProgramProgress, SetLog, Difficulty, LocationType, Achievement } from './types';

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

const AchievementDetailModal = ({ achievement, dateUnlocked, onClose }: { achievement: Achievement, dateUnlocked?: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl max-w-xs w-full text-center relative overflow-hidden animate-bounce-in"
        onClick={(e) => e.stopPropagation()} // Prevent close on card click
      >
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 mt-2">
          <div className="mx-auto w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-emerald-500/30">
            <span className="text-5xl drop-shadow-md">{achievement.icon}</span>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">{achievement.name}</h2>
          
          <div className="my-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              {achievement.description}
            </p>
          </div>
          
          {dateUnlocked ? (
             <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                <CheckCircle className="w-4 h-4 fill-current" /> Conseguido
             </div>
          ) : (
             <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-500 border border-slate-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                <Lock className="w-4 h-4" /> Bloqueado
             </div>
          )}
          
          {dateUnlocked && (
             <p className="text-xs text-slate-600 font-bold mt-3 uppercase tracking-wider">
                {new Date(dateUnlocked).toLocaleDateString()}
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

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

const AchievementsView = ({ user, setView }: { user: UserState, setView: (v: ViewState) => void }) => {
   const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);
   const [activeCategory, setActiveCategory] = useState<'TODOS' | 'GENERAL' | 'ENTRENAMIENTO' | 'FUERZA' | 'RESISTENCIA'>('TODOS');
   const unlockedCount = user.achievements.length;
   const totalCount = ACHIEVEMENTS.length;

   // Helper: Get Rank Title (reused logic)
   const getRankTitle = (level: number) => {
      if (level >= 50) return "Leyenda Viviente";
      if (level >= 30) return "Maestro Fitness";
      if (level >= 20) return "Veterano de Hierro";
      if (level >= 12) return "Atleta Táctico"; 
      if (level >= 10) return "Guerrero Élite";
      if (level >= 5) return "Aventurero";
      return "Novato";
   };

   // Helper: Calculate Streak
   const calculateStreak = () => {
      if (user.history.length === 0) return 0;
      
      const sortedDates = [...user.history]
         .map(log => new Date(log.date).setHours(0,0,0,0))
         .sort((a,b) => b - a); // Descending
      
      // Unique days
      const uniqueDays = Array.from(new Set(sortedDates));
      
      let streak = 0;
      const today = new Date().setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last workout was before yesterday, streak is broken (unless logic allows rest days, keeping simple here)
      if (uniqueDays[0] < yesterday.getTime()) return 0;

      // Check consecutive days backwards
      let checkDate = new Date(uniqueDays[0]); // Start with latest
      
      for (let i = 0; i < uniqueDays.length; i++) {
         const d = new Date(uniqueDays[i]);
         if (d.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
         } else {
            break;
         }
      }
      return streak;
   };

   const currentStreak = calculateStreak();

   // Filter Logic
   const filteredAchievements = useMemo(() => {
      let filtered = ACHIEVEMENTS;
      if (activeCategory !== 'TODOS') {
         filtered = filtered.filter(ach => ach.category === activeCategory || (activeCategory === 'ENTRENAMIENTO' && ach.category === 'ESPECIAL'));
      }
      // Sort: Unlocked first within category
      return [...filtered].sort((a, b) => {
         const isA = user.achievements.includes(a.id);
         const isB = user.achievements.includes(b.id);
         return (isA === isB) ? 0 : isA ? -1 : 1;
      });
   }, [user.achievements, activeCategory]);

   // Recent Milestone (Last unlocked)
   const recentMilestone = useMemo(() => {
      if (user.achievements.length === 0) return null;
      const lastId = user.achievements[user.achievements.length - 1];
      return ACHIEVEMENTS.find(a => a.id === lastId);
   }, [user.achievements]);

   // Categories config
   const categories = [
      { id: 'TODOS', label: 'Todos' },
      { id: 'GENERAL', label: 'General' },
      { id: 'ENTRENAMIENTO', label: 'Entrenamiento' },
      { id: 'FUERZA', label: 'Nutrición' }, 
      { id: 'RESISTENCIA', label: 'Hábito' },
   ];

   // Circular Progress Maths
   const radius = 80;
   const circumference = 2 * Math.PI * radius; // approx 502
   const percent = Math.min(100, Math.max(0, (user.currentXP / user.nextLevelXP) * 100));
   // We want a 270 degree arc (3/4 of a circle)
   // 270/360 = 0.75
   const dashArray = circumference * 0.75; 
   // Dash offset for progress:
   // Full empty (0%) = dashArray
   // Full full (100%) = 0
   const dashOffset = dashArray - (dashArray * (percent / 100));

   return (
      <div className="min-h-screen bg-slate-900 text-white animate-fade-in pb-24">
         {/* Navbar */}
         <div className="flex items-center justify-between p-4 sticky top-0 bg-slate-900/90 backdrop-blur-md z-30 pt-safe-top">
            <button onClick={() => setView('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
               <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-lg font-bold">Logros y Niveles</h1>
            <button className="text-xs font-bold text-emerald-500 hover:text-emerald-400">Reglas</button>
         </div>

         <div className="px-4 space-y-8">
            
            {/* Level Circle Section */}
            <div className="flex flex-col items-center justify-center mt-2">
               <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 220 220">
                     <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#10b981" />
                           <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                     </defs>
                     
                     {/* Background Track */}
                     <circle
                        cx="110" cy="110" r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={dashArray} 
                        strokeDashoffset="0"
                        transform="rotate(135 110 110)" 
                     />
                     
                     {/* Progress Fill */}
                     <circle
                        cx="110" cy="110" r={radius}
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        transform="rotate(135 110 110)"
                        className="transition-all duration-1000 ease-out"
                     />
                  </svg>
                  
                  {/* Inner Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">NIVEL</span>
                     <span className="text-6xl font-black text-white leading-none tracking-tighter">{user.level}</span>
                  </div>
               </div>

               <h2 className="text-2xl font-bold mt-2 text-center">{getRankTitle(user.level)}</h2>
               <p className="text-slate-400 text-xs text-center max-w-[250px] mt-1 mb-6">
                  Tu consistencia está transformando tu biología.
               </p>

               {/* XP Bar Linear with labels */}
               <div className="w-full space-y-2">
                  <div className="flex justify-between items-end text-xs font-bold text-slate-400 px-1">
                     <span>Nivel {user.level}</span>
                     <span className="text-emerald-500 text-sm">{user.currentXP} / {user.nextLevelXP} XP</span>
                     <span>Nivel {user.level + 1}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative">
                     <div 
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(5, percent)}%` }}
                     ></div>
                  </div>
                  <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-2">
                     ¡SOLO {user.nextLevelXP - user.currentXP} XP PARA EL SIGUIENTE RANGO!
                  </p>
               </div>

               {/* Chips */}
               <div className="flex gap-3 mt-6 w-full max-w-sm mx-auto">
                  <div className="flex-1 bg-emerald-900/10 border border-emerald-500/20 px-3 py-3 rounded-2xl flex items-center justify-center gap-2">
                     <Trophy className="w-5 h-5 text-emerald-500" />
                     <span className="text-sm font-bold text-emerald-100">{unlockedCount} / {totalCount} Logros</span>
                  </div>
                  <div className="flex-1 bg-orange-900/10 border border-orange-500/20 px-3 py-3 rounded-2xl flex items-center justify-center gap-2">
                     <Flame className="w-5 h-5 text-orange-500" />
                     <span className="text-sm font-bold text-orange-100">{currentStreak} Días Racha</span>
                  </div>
               </div>
            </div>

            {/* Hito Reciente (Featured Card) */}
            {recentMilestone && (
               <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3 px-1">
                     <Star className="w-5 h-5 text-emerald-500 fill-current" />
                     <h3 className="font-bold text-lg">Hito Reciente</h3>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-3xl bg-slate-800 border border-slate-700 h-48 group cursor-pointer shadow-xl" onClick={() => setSelectedAch(recentMilestone)}>
                     {/* Background Image Placeholder */}
                     <div className="absolute inset-0 bg-slate-700">
                        <img 
                           src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                           alt="Gym Background" 
                           className="w-full h-full object-cover opacity-40 mix-blend-overlay grayscale-[0.3]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                     </div>

                     <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                           <h4 className="text-xl font-bold text-white max-w-[70%] leading-tight drop-shadow-md">{recentMilestone.name}</h4>
                           <span className="bg-emerald-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                              NUEVO
                           </span>
                        </div>
                        
                        <div>
                           <p className="text-sm text-slate-200 line-clamp-2 mb-3 drop-shadow-sm font-medium">{recentMilestone.description}</p>
                           <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {recentMilestone.category} 
                              <span className="text-slate-400">•</span>
                              {user.achievementDates?.[recentMilestone.id] ? new Date(user.achievementDates[recentMilestone.id]).toLocaleDateString() : 'Hoy'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Colección Grid */}
            <div className="pt-2">
               <div className="flex justify-between items-end mb-5 px-1">
                  <h3 className="font-bold text-lg">Colección</h3>
                  <div className="flex gap-3 text-xs font-bold">
                     <span className="text-emerald-500">Todos</span>
                     <span className="text-slate-600">Por Desbloquear</span>
                  </div>
               </div>

               {/* Filter Tabs */}
               <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mb-2">
                  {categories.map(cat => (
                     <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                           activeCategory === cat.id 
                           ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' 
                           : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                     >
                        {cat.label}
                     </button>
                  ))}
               </div>

               {/* Circular Grid Layout */}
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
                  {filteredAchievements.map(ach => {
                     const isUnlocked = user.achievements.includes(ach.id);
                     
                     return (
                        <div 
                           key={ach.id}
                           onClick={() => { if(isUnlocked) setSelectedAch(ach); }}
                           className={`relative flex flex-col items-center text-center p-4 rounded-3xl border transition-all duration-300 ${
                              isUnlocked 
                              ? 'bg-emerald-900/5 border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10' 
                              : 'bg-slate-800/20 border-slate-800 opacity-60 cursor-default'
                           }`}
                        >
                           <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 relative border-2 ${
                              isUnlocked 
                              ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-900/20 group-hover:scale-105' 
                              : 'bg-slate-800 border-slate-700 text-slate-600 grayscale'
                           }`}>
                              {/* Icon */}
                              <span className="text-2xl">{ach.icon}</span>
                           </div>
                           
                           <h4 className={`text-xs font-bold leading-tight mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                              {ach.name}
                           </h4>
                           
                           <p className="text-[10px] font-medium text-slate-500 line-clamp-2 leading-tight">
                              {ach.description}
                           </p>
                        </div>
                     );
                  })}
               </div>
            </div>

         </div>

         {/* Detail Modal */}
         {selectedAch && (
            <AchievementDetailModal 
                achievement={selectedAch} 
                dateUnlocked={user.achievementDates ? user.achievementDates[selectedAch.id] : undefined}
                onClose={() => setSelectedAch(null)} 
            />
         )}
      </div>
   );
};

// --- Dashboard View (Simplified for fix) ---
const DashboardView = ({ user, setView }: { user: UserState, setView: (v: ViewState) => void }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white animate-fade-in p-4 pb-24">
      <div className="flex justify-between items-center mb-8 pt-safe-top">
         <div>
            <h1 className="text-2xl font-black">Hola, {user.name.split(' ')[0]}</h1>
            <p className="text-slate-400 text-sm">Nivel {user.level} • {user.currentXP} XP</p>
         </div>
         <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <button onClick={() => setView('training')} className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-lg shadow-blue-500/20 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Dumbbell className="w-32 h-32" />
            </div>
            <Dumbbell className="w-8 h-8 text-white mb-2 relative z-10" />
            <h3 className="text-xl font-black text-white relative z-10">Entrenar</h3>
            <p className="text-blue-200 text-sm relative z-10">Iniciar rutina</p>
         </button>

         <button onClick={() => setView('achievements')} className="bg-slate-800 p-5 rounded-3xl border border-slate-700 text-left hover:bg-slate-750 transition-colors group">
            <Trophy className="w-8 h-8 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white">Logros</h3>
            <p className="text-slate-500 text-xs">Ver colección</p>
         </button>

         <button onClick={() => setView('stats')} className="bg-slate-800 p-5 rounded-3xl border border-slate-700 text-left hover:bg-slate-750 transition-colors group">
            <BarChart2 className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white">Estadísticas</h3>
            <p className="text-slate-500 text-xs">Tu progreso</p>
         </button>
      </div>
      
      <button onClick={() => supabase.auth.signOut()} className="w-full py-4 rounded-xl text-slate-500 font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
         <LogOut className="w-5 h-5" /> Cerrar Sesión
      </button>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<UserState>(INITIAL_USER_STATE);
  const [view, setView] = useState<ViewState>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if(!session) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(!session) setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      const fetchUser = async () => {
         try {
           const { data } = await supabase.from('user_progress').select('state').eq('user_id', session.user.id).single();
           if(data?.state) setUser(prev => ({...prev, ...data.state}));
           else setShowWelcome(true);
         } catch(e) { console.error(e); }
         finally { setLoading(false); }
      };
      fetchUser();
    }
  }, [session]);

  const updateUser = async (newState: UserState) => {
     setUser(newState);
     if(session?.user) {
        await supabase.from('user_progress').upsert({ user_id: session.user.id, state: newState });
     }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8" /></div>;
  if (!session) return <AuthView />;
  if (showWelcome) return <WelcomeView onContinue={() => { setShowWelcome(false); updateUser(user); }} />;

  return (
    <div className={user.settings.darkMode ? 'dark' : ''}>
       {view === 'dashboard' && <DashboardView user={user} setView={setView} />}
       {view === 'achievements' && <AchievementsView user={user} setView={setView} />}
       {/* Other views placeholders */}
       {!['dashboard', 'achievements'].includes(view) && (
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
             <h2 className="text-xl">Vista en construcción: {view}</h2>
             <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-slate-700 rounded-lg">Volver</button>
          </div>
       )}
    </div>
  );
}