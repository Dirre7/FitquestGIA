import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Trophy, Activity, User, BarChart2, Home, Lock, CheckCircle, Play, 
  Zap, Dumbbell, Clock, ChevronRight, Sun, Moon, Cloud, X, Star, 
  Maximize2, Medal, Award, Calendar, Repeat, Flame, RefreshCw, Trash2,
  Hash, Timer, TrendingUp, LogOut, Loader2, Sparkles, MessageSquare, Bot,
  Camera, Image as ImageIcon, Info, Filter, ArrowLeft, Check, Pause, SkipForward, Plus,
  Scale, Ruler, CalendarDays, Calculator, LayoutGrid, ChevronLeft, MoreHorizontal, Settings
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from './services/supabaseClient';
import { getAiCoachAdvice } from './services/geminiService';
import { AuthView } from './components/AuthView';
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

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 animate-bounce-in relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Trash2 className="w-24 h-24" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white relative z-10">{title}</h3>
        <p className="text-slate-500 dark:text-slate-300 mb-6 text-sm relative z-10">{message}</p>
        <div className="flex gap-3 relative z-10">
          <button onClick={onCancel} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            Abandonar
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

const AvatarSelectionModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void }) => {
  const [customUrl, setCustomUrl] = useState('');
  
  // Categorías de avatares
  const avatarCollections = [
    {
      name: 'Aventureros RPG',
      style: 'adventurer',
      seeds: ['Felix', 'Aneka', 'Zack', 'Midnight', 'Luna', 'Shadow', 'Buddy', 'Giggle', 'Bandit', 'Whiskers', 'Leo', 'Willow', 'Sheba', 'Cuddles', 'Abby', 'Chester']
    },
    {
      name: 'Cyborgs',
      style: 'bottts',
      seeds: ['C3PO', 'R2D2', 'WallE', 'Eve', 'Bender', 'Tron', 'Data', 'Cyber', 'Glitch', 'Spark', 'Chip', 'Byte']
    },
    {
      name: 'Humanos',
      style: 'avataaars',
      seeds: ['John', 'Jane', 'Alex', 'Sarah', 'Mike', 'Emily', 'Chris', 'Katie', 'David', 'Lisa', 'Ryan', 'Amy']
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-bounce-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Elige tu Avatar</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 mb-4 flex-1">
          {avatarCollections.map((collection) => (
            <div key={collection.name} className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                {collection.name}
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {collection.seeds.map(seed => {
                  const url = `https://api.dicebear.com/7.x/${collection.style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                  return (
                    <button 
                      key={seed}
                      onClick={() => { onSelect(url); onClose(); }}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary-500 hover:scale-105 hover:shadow-md transition-all bg-slate-100 dark:bg-slate-700/50 group"
                    >
                      <ImageWithFallback src={url} alt={seed} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
            <p className="text-sm text-slate-500 mb-2 font-bold">O usa una URL personalizada</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-primary-500 outline-none transition-colors"
                />
              </div>
              <button 
                onClick={() => { if(customUrl) { onSelect(customUrl); onClose(); } }}
                disabled={!customUrl}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-primary-500 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Views ---

const DashboardView = ({ user, setView }: { user: UserState; setView: (v: ViewState) => void }) => {
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
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl p-6 border border-slate-800 group">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex items-center gap-6">
          {/* Avatar & Level */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-800 shadow-xl overflow-hidden bg-slate-700">
               <ImageWithFallback src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            
            {/* Big Level Badge */}
            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white shadow-lg border-4 border-slate-900 transform rotate-6 hover:rotate-0 transition-transform cursor-pointer group-hover:scale-110 duration-300">
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
             <h3 className="text-2xl sm:text-3xl font-black tracking-tight truncate mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 drop-shadow-sm">
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
            <div>
              <div className="flex items-center gap-2 text-primary-300 font-bold text-xs uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Programa Activo
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic">{activeProgram.title}</h2>
              <p className="text-slate-300 text-sm mt-1">
                Progreso: Día {activeProgress.currentDayIndex + 1} de {activeProgram.schedule.length}
              </p>
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
          
          {/* Progress Bar Bottom */}
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-800">
            <div 
              className="h-full bg-primary-400" 
              style={{ width: `${((activeProgress.currentDayIndex) / activeProgram.schedule.length) * 100}%` }}
            ></div>
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

      {/* AI Coach Card */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-2 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Bot className="w-24 h-24 text-indigo-500" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" /> FitQuest Coach AI
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

const ProgramsView = ({ user, startProgram, continueProgram, abandonProgram }: { 
  user: UserState; 
  startProgram: (p: Program) => void;
  continueProgram: () => void;
  abandonProgram: () => void;
}) => {
  // Use "Despertar Casero" or first program as featured
  const featuredProgram = PROGRAMS.find(p => p.id === 'prog_home_beg') || PROGRAMS[0];
  
  // Group programs by difficulty to mimic "Categories" from the screenshot
  const programsByDifficulty = useMemo(() => {
    const groups: Record<string, Program[]> = {
      [Difficulty.BEGINNER]: [],
      [Difficulty.INTERMEDIATE]: [],
      [Difficulty.ADVANCED]: [],
    };
    PROGRAMS.forEach(p => {
      if (groups[p.difficulty]) groups[p.difficulty].push(p);
    });
    return groups;
  }, []);

  return (
    <div className="space-y-8 pb-28 animate-fade-in text-white">
      
      {/* 1. HERO BANNER */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
        {/* Featured Image */}
        <div className="absolute inset-y-0 right-0 w-3/4">
           {/* Fallback image that represents full body/fitness */}
           <img 
            src="https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=800" 
            alt="Hero" 
            className="w-full h-full object-cover object-top opacity-80"
          />
        </div>
        
        <div className="absolute inset-0 z-20 p-6 flex flex-col justify-center max-w-[70%]">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
            {featuredProgram.title}
          </h1>
          <p className="text-slate-300 text-sm mb-6 line-clamp-3">
             {featuredProgram.description}
          </p>
          <button 
            onClick={() => startProgram(featuredProgram)}
            className="w-fit bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary-500/30"
          >
            Ver entrenamientos
          </button>
          <div className="flex gap-2 mt-4">
             {[1,2,3,4].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-primary-500' : 'bg-slate-600'}`}></div>)}
          </div>
        </div>
      </div>

      {/* 2. CHIP FILTERS */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide no-scrollbar">
         {['Frecuencia', 'Objetivo', 'Nivel', 'Duración', 'Equipo'].map((label, idx) => (
           <button 
             key={label}
             className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border border-transparent
               ${idx === 0 ? 'bg-slate-800 text-primary-500 border-primary-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
             `}
           >
             {label}
           </button>
         ))}
      </div>
      
      {/* 3. CATEGORIES & HORIZONTAL CARDS */}
      <div className="space-y-8">
        {/* Fixed TS error: explicitly type the map arguments to avoid 'unknown' */}
        {Object.entries(programsByDifficulty).map(([difficulty, progs]: [string, Program[]]) => {
          if (progs.length === 0) return null;
          
          // Map Difficulty to a catchy title like in the screenshot
          let sectionTitle = "Entrenamientos";
          let subTitle = "Mejora tu nivel";
          
          if (difficulty === Difficulty.BEGINNER) { sectionTitle = "Perder Peso & Inicio"; subTitle = "Rutinas de adaptación"; }
          else if (difficulty === Difficulty.INTERMEDIATE) { sectionTitle = "Hipertrofia"; subTitle = "Aumentar Masa Muscular"; }
          else if (difficulty === Difficulty.ADVANCED) { sectionTitle = "Definición Extrema"; subTitle = "Intensidad Máxima"; }

          return (
            <div key={difficulty}>
              <div className="flex justify-between items-end mb-4 px-1">
                 <h2 className="text-xl font-bold text-white">{sectionTitle}</h2>
                 <button className="text-primary-500 text-sm font-bold hover:underline">Ver todos</button>
              </div>

              <div className="grid gap-4">
                {progs.map(prog => {
                  const isActive = user.activeProgram?.programId === prog.id;
                  // Get first exercise image of first day as thumbnail, or generic
                  const thumb = prog.schedule[0]?.exercises[0]?.image || "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg";

                  return (
                    <div 
                      key={prog.id}
                      onClick={() => {
                        if (user.activeProgram && !isActive) return; // Locked logic
                        if (isActive) continueProgram();
                        else startProgram(prog);
                      }}
                      className={`relative bg-slate-800 rounded-2xl overflow-hidden h-28 flex cursor-pointer transition-transform active:scale-95 group border border-slate-700 hover:border-slate-600
                        ${isActive ? 'ring-2 ring-primary-500' : ''}
                        ${user.activeProgram && !isActive ? 'opacity-50 grayscale' : ''}
                      `}
                    >
                       {/* Text Content Left */}
                       <div className="flex-1 p-5 flex flex-col justify-center z-10">
                          <h3 className="text-lg font-bold text-white leading-tight mb-1">{prog.title}</h3>
                          <p className="text-slate-400 text-xs font-medium">{subTitle}</p>
                          
                          {isActive && (
                            <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center gap-1 text-primary-500 text-xs font-bold">
                                   <Play className="w-3 h-3 fill-current" /> Continuar
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abandonProgram();
                                  }}
                                  className="flex items-center gap-1 text-red-500 text-xs font-bold hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                                >
                                   <Trash2 className="w-3 h-3" /> Abandonar
                                </button>
                            </div>
                          )}
                          {user.activeProgram && !isActive && (
                             <div className="mt-2 flex items-center gap-1 text-slate-500 text-xs font-bold">
                               <Lock className="w-3 h-3" /> Bloqueado
                            </div>
                          )}
                       </div>

                       {/* Image Right (Cutout style simulation) */}
                       <div className="w-1/3 relative overflow-hidden">
                          {/* Diagonal mask effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-transparent to-transparent z-10"></div>
                          <img 
                            src={thumb} 
                            alt={prog.title} 
                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                          />
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

const AchievementsView = ({ user }: { user: UserState }) => {
  const unlockedIds = user.achievements || [];

  // Sort: Unlocked first
  const sortedAchievements = useMemo(() => {
    return [...ACHIEVEMENTS].sort((a, b) => {
      const isUnlockedA = unlockedIds.includes(a.id);
      const isUnlockedB = unlockedIds.includes(b.id);
      // If A is unlocked and B is not, A goes first (-1)
      if (isUnlockedA && !isUnlockedB) return -1;
      // If B is unlocked and A is not, B goes first (1)
      if (!isUnlockedA && isUnlockedB) return 1;
      // Keep original order otherwise
      return 0;
    });
  }, [unlockedIds]);
  
  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold">Salón de la Fama</h2>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200 dark:border-yellow-700">
          {unlockedIds.length} / {ACHIEVEMENTS.length}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedAchievements.map(ach => {
          const isUnlocked = unlockedIds.includes(ach.id);
          return (
            <div 
              key={ach.id} 
              className={`glass-card p-4 rounded-xl flex flex-col items-center text-center transition-all duration-300 ${
                isUnlocked 
                  ? 'border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10 shadow-lg scale-100 opacity-100' 
                  : 'border-2 border-transparent opacity-50 grayscale scale-95 hover:opacity-70'
              }`}
            >
              <div className="text-4xl mb-3 relative">
                {ach.icon}
                {!isUnlocked && <Lock className="w-6 h-6 absolute -bottom-1 -right-1 text-slate-500" />}
              </div>
              <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{ach.name}</h4>
              <p className="text-[10px] text-slate-500 leading-tight">{ach.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatsView = ({ user, setUser }: { user: UserState; setUser: (u: UserState) => void }) => {
  // --- Derived Stats Calculations ---
  
  // Basic aggregates
  const totalWorkouts = user.completedWorkouts;
  const totalWeight = user.totalWeightLifted;
  
  // Calculate from history
  const historyStats = useMemo(() => {
    const logs = user.history || [];
    // Use explicit total duration if available, else sum from logs (fallback for old users)
    const totalMinutes = user.totalDurationMinutes !== undefined 
      ? user.totalDurationMinutes 
      : logs.reduce((acc, log) => acc + log.durationMinutes, 0);
    
    const totalXP = logs.reduce((acc, log) => acc + log.xpEarned, 0);
    
    // Safely sum sets/reps (handling legacy data where they might be undefined)
    const totalSets = logs.reduce((acc, log) => acc + (log.totalSets || 0), 0);
    const totalReps = logs.reduce((acc, log) => acc + (log.totalReps || 0), 0);
    
    const totalKcal = user.totalKcalBurned !== undefined
      ? user.totalKcalBurned
      : logs.reduce((acc, log) => acc + (log.kcalBurned || 0), 0);

    return { totalMinutes, totalXP, totalSets, totalReps, totalKcal };
  }, [user.history, user.totalDurationMinutes, user.totalKcalBurned]);

  // Chart Data: Last 10 sessions for cleaner charts
  const historyData = useMemo(() => {
    const safeHistory = Array.isArray(user.history) ? user.history : [];
    if (safeHistory.length === 0) return [];
    
    // Last 10 sessions reversed to show chronologically left to right
    return [...safeHistory].slice(0, 10).reverse().map(h => ({
      date: new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      xp: h.xpEarned,
      weight: h.totalVolume,
      min: h.durationMinutes
    }));
  }, [user.history]);

  // BMI Calculation
  const bmi = useMemo(() => {
    if (user.weight > 0 && user.height > 0) {
      const heightInMeters = user.height / 100;
      return (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  }, [user.weight, user.height]);

  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { label: "Bajo Peso", color: "text-blue-500", bg: "bg-blue-500" };
    if (val < 25) return { label: "Saludable", color: "text-green-500", bg: "bg-green-500" };
    if (val < 30) return { label: "Sobrepeso", color: "text-yellow-500", bg: "bg-yellow-500" };
    return { label: "Obesidad", color: "text-red-500", bg: "bg-red-500" };
  };

  const bmiStatus = bmi ? getBmiStatus(parseFloat(bmi)) : null;

  const StatCard = ({ icon: Icon, title, value, sub, colorClass }: any) => (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</div>
        {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold">Estadísticas</h2>
        <div className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
          Histórico Global
        </div>
      </div>
      
      {/* Biometrics Input Section */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
           <Calculator className="w-5 h-5" />
           <h3 className="font-bold text-sm uppercase tracking-wider">Datos Corporales</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
           {/* Weight Input */}
           <div className="space-y-1">
             <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Peso (kg)</label>
             <div className="relative">
               <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="number" 
                 value={user.weight || ''}
                 onChange={(e) => setUser({...user, weight: parseFloat(e.target.value) || 0})}
                 placeholder="0"
                 className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:border-primary-500 outline-none transition-colors"
               />
             </div>
           </div>

           {/* Height Input */}
           <div className="space-y-1">
             <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Altura (cm)</label>
             <div className="relative">
               <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="number" 
                 value={user.height || ''}
                 onChange={(e) => setUser({...user, height: parseFloat(e.target.value) || 0})}
                 placeholder="0"
                 className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:border-primary-500 outline-none transition-colors"
               />
             </div>
           </div>

            {/* Age Input */}
            <div className="space-y-1">
             <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Edad</label>
             <div className="relative">
               <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="number" 
                 value={user.age || ''}
                 onChange={(e) => setUser({...user, age: parseFloat(e.target.value) || 0})}
                 placeholder="0"
                 className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:border-primary-500 outline-none transition-colors"
               />
             </div>
           </div>
        </div>

        {/* BMI Visualization */}
        {bmi && bmiStatus && (
           <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                 <div className="text-[10px] text-slate-400 uppercase font-bold">IMC Estimado</div>
                 <div className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    {bmi}
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${bmiStatus.color}`}>
                       {bmiStatus.label}
                    </span>
                 </div>
              </div>
              
              {/* Visual Gauge */}
              <div className="flex gap-1">
                 {[1,2,3,4].map(i => {
                    let active = false;
                    let color = "bg-slate-200 dark:bg-slate-700";
                    if (bmiStatus.label === "Bajo Peso" && i === 1) { active = true; color = "bg-blue-500"; }
                    if (bmiStatus.label === "Saludable" && i === 2) { active = true; color = "bg-green-500"; }
                    if (bmiStatus.label === "Sobrepeso" && i === 3) { active = true; color = "bg-yellow-500"; }
                    if (bmiStatus.label === "Obesidad" && i === 4) { active = true; color = "bg-red-500"; }
                    
                    return (
                       <div key={i} className={`w-3 h-8 rounded-full ${color} ${active ? 'scale-110 shadow-lg' : 'opacity-40'} transition-all`}></div>
                    )
                 })}
              </div>
           </div>
        )}
      </div>
      
      {/* Grid of Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard 
          icon={Dumbbell} 
          title="Peso Total" 
          value={totalWeight > 1000 ? `${(totalWeight/1000).toFixed(1)}t` : `${totalWeight}kg`} 
          sub="Volumen movido"
          colorClass="bg-blue-500 text-blue-500"
        />
        <StatCard 
          icon={Activity} 
          title="Sesiones" 
          value={totalWorkouts} 
          sub="Entrenamientos"
          colorClass="bg-green-500 text-green-500"
        />
        <StatCard 
          icon={Flame} 
          title="Calorías" 
          value={historyStats.totalKcal > 1000 ? `${(historyStats.totalKcal/1000).toFixed(1)}k` : historyStats.totalKcal} 
          sub="Energía quemada"
          colorClass="bg-red-500 text-red-500"
        />
        <StatCard 
          icon={Timer} 
          title="Tiempo" 
          value={historyStats.totalMinutes > 60 ? `${(historyStats.totalMinutes/60).toFixed(1)}h` : `${historyStats.totalMinutes}m`} 
          sub="Inv. en salud"
          colorClass="bg-orange-500 text-orange-500"
        />
         <StatCard 
          icon={Hash} 
          title="Series" 
          value={historyStats.totalSets} 
          sub="Completadas"
          colorClass="bg-purple-500 text-purple-500"
        />
         <StatCard 
          icon={Zap} 
          title="XP Total" 
          value={user.currentXP + (user.level * 500)} // Rough estimate of lifetime XP or use precise if tracked
          sub="Nivel actual"
          colorClass="bg-yellow-500 text-yellow-500"
        />
      </div>

      {historyData.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center opacity-80 border-dashed border-2 border-slate-300 dark:border-slate-700">
            <BarChart2 className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-500">Sin datos suficientes</h3>
            <p className="text-slate-400">Completa tu primera misión para ver gráficos detallados.</p>
          </div>
      ) : (
        <div className="space-y-6">
          {/* Volume Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-semibold mb-6 text-slate-500 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> Progreso de Carga (Últimas 10 sesiones)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} width={30} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                      contentStyle={{ backgroundColor: user.settings.darkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} 
                      itemStyle={{ color: '#14b8a6' }}
                      formatter={(val: number) => [`${val} kg`, "Volumen"]}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

           {/* XP & Time Chart */}
           <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-semibold mb-6 text-slate-500 flex items-center">
              <Clock className="w-4 h-4 mr-2" /> Tiempo por Sesión (min)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                  <Tooltip 
                      contentStyle={{ backgroundColor: user.settings.darkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none' }} 
                      itemStyle={{ color: '#8b5cf6' }}
                      formatter={(val: number) => [`${val} min`, "Duración"]}
                  />
                  <Bar dataKey="min" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileView = ({ user, setUser, toggleTheme, signOut }: { 
  user: UserState; 
  setUser: (u: UserState) => void;
  toggleTheme: () => void;
  signOut: () => void;
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const saveName = () => {
    setUser({ ...user, name: newName });
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
       <h2 className="text-2xl font-bold px-1">Perfil</h2>
       
       {/* Avatar & Name Section */}
       <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-500/20 to-secondary-500/20"></div>
          
          <div className="relative mb-4">
             <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-200">
               <ImageWithFallback src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <button 
               onClick={() => setShowAvatarModal(true)}
               className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
             >
                <Camera className="w-4 h-4" />
             </button>
          </div>

          {isEditingName ? (
            <div className="flex gap-2 items-center mb-1">
               <input 
                 type="text" 
                 value={newName} 
                 onChange={(e) => setNewName(e.target.value)}
                 className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-lg font-bold text-center w-full max-w-[200px]"
                 autoFocus
               />
               <button onClick={saveName} className="p-2 bg-green-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
            </div>
          ) : (
            <h3 className="text-2xl font-black flex items-center gap-2 mb-1">
               {user.name} 
               <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-primary-500"><Settings className="w-4 h-4" /></button>
            </h3>
          )}
          
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-6">Nivel {user.level} • {user.currentXP} XP</p>

          <div className="grid grid-cols-2 gap-4 w-full">
             <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-500 font-bold uppercase">Entrenamientos</div>
                <div className="text-xl font-black text-slate-800 dark:text-white">{user.completedWorkouts}</div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-500 font-bold uppercase">Peso Total</div>
                <div className="text-xl font-black text-slate-800 dark:text-white">{(user.totalWeightLifted/1000).toFixed(1)}k</div>
             </div>
          </div>
       </div>

       {/* Settings Section */}
       <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-500 px-1 uppercase">Ajustes</h4>
          
          <div className="glass-card p-4 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${user.settings.darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>
                   {user.settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                   <div className="font-bold text-sm">Modo Oscuro</div>
                   <div className="text-xs text-slate-500">Cambiar apariencia</div>
                </div>
             </div>
             <button 
               onClick={toggleTheme}
               className={`w-12 h-6 rounded-full p-1 transition-colors ${user.settings.darkMode ? 'bg-primary-500' : 'bg-slate-300'}`}
             >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${user.settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
             </button>
          </div>

          <button 
             onClick={signOut}
             className="w-full glass-card p-4 rounded-xl flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
             <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500">
                <LogOut className="w-5 h-5" />
             </div>
             <div className="text-left">
                <div className="font-bold text-sm">Cerrar Sesión</div>
                <div className="text-xs text-red-400">Salir de tu cuenta</div>
             </div>
          </button>
       </div>
       
       <AvatarSelectionModal 
         isOpen={showAvatarModal} 
         onClose={() => setShowAvatarModal(false)}
         onSelect={(url) => setUser({...user, avatar: url})}
       />
    </div>
  );
};

// --- New Exercise Logger Modal Component (Matches Screenshot 4) ---
const ExerciseLoggerModal = ({ 
  exercise, 
  onSave, 
  onClose 
}: { 
  exercise: ActiveExerciseState, 
  onSave: (setsLog: SetLog[]) => void, 
  onClose: () => void 
}) => {
  const [localSets, setLocalSets] = useState<SetLog[]>(JSON.parse(JSON.stringify(exercise.setsLog)));

  const handleAddSet = () => {
    const lastSet = localSets[localSets.length - 1];
    setLocalSets([...localSets, {
      setNumber: localSets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
      completed: false
    }]);
  };

  const handleUpdateSet = (index: number, field: 'reps' | 'weight', value: number) => {
    const newSets = [...localSets];
    newSets[index] = { ...newSets[index], [field]: value };
    // Auto-complete if values are entered? Let's leave manual completion for flexibility
    // But since this is a modal, "Guardar" implies completion. 
    // In screenshot style, user enters numbers. We assume they did them if they save.
    // We'll mark them as completed when Saving if they have valid values.
    setLocalSets(newSets);
  };

  const handleSave = () => {
    // Mark sets with data as completed automatically when saving from this modal
    const processedSets = localSets.map(s => ({
      ...s,
      completed: (s.reps > 0 && s.weight >= 0) ? true : s.completed
    }));
    onSave(processedSets);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900 text-white flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800">
        <button onClick={onClose} className="text-primary-500 font-bold text-lg">Cancelar</button>
        <h2 className="font-bold text-lg">Configurar Ejercicio</h2>
        <button onClick={handleSave} className="text-primary-500 font-bold text-lg">Guardar</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900">
        
        {/* Exercise Info Card */}
        <div className="flex gap-4 items-center">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-white shrink-0">
             <ImageWithFallback src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
             <h1 className="text-2xl font-bold leading-tight mb-1">{exercise.name}</h1>
             <div className="text-slate-400 text-sm flex flex-wrap gap-2">
               <span>Pectorales, Antebrazo, Tríceps</span> {/* Hardcoded for demo/screenshot match, ideally dynamic */}
             </div>
          </div>
          <Info className="text-slate-500 w-6 h-6" />
        </div>

        {/* Tabs (Visual only for now) */}
        <div className="flex gap-2">
           <button className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold border border-transparent">Reps y carga <ChevronRight className="inline w-3 h-3 ml-1 rotate-90"/></button>
           <button className="bg-slate-900 text-slate-500 border border-slate-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1"><Timer className="w-3 h-3" /> 01:00</button>
           <button className="bg-slate-900 text-slate-500 border border-slate-800 px-4 py-2 rounded-full text-sm font-bold">+ Notas</button>
        </div>

        <div className="bg-primary-500/10 p-2 rounded-lg text-primary-500 text-xs font-bold uppercase tracking-wider mb-2">high load</div>

        {/* Sets List */}
        <div className="space-y-3">
           {localSets.map((set, idx) => (
             <div key={idx} className="bg-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                   <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm">
                     {set.setNumber}
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={set.reps || ''}
                        onChange={(e) => handleUpdateSet(idx, 'reps', Number(e.target.value))}
                        placeholder="0"
                        className="bg-transparent text-white font-bold text-xl w-12 text-center focus:outline-none border-b border-slate-700 focus:border-primary-500"
                      />
                      <span className="text-slate-500 font-bold">reps</span>
                   </div>

                   <div className="w-px h-8 bg-slate-700 mx-2"></div>

                   <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={set.weight || ''}
                        onChange={(e) => handleUpdateSet(idx, 'weight', Number(e.target.value))}
                        placeholder="0"
                        className="bg-transparent text-white font-bold text-xl w-16 text-center focus:outline-none border-b border-slate-700 focus:border-primary-500"
                      />
                      <span className="text-slate-500 font-bold">kg</span>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Add Set Button */}
        <button 
          onClick={handleAddSet}
          className="w-full py-4 flex items-center justify-center gap-2 text-primary-500 font-bold bg-primary-500/10 rounded-xl hover:bg-primary-500/20 transition-colors"
        >
           <Plus className="w-5 h-5 bg-primary-500 text-slate-900 rounded-full p-0.5" />
           Agregar serie
        </button>

      </div>
    </div>
  );
};

const ActiveWorkoutView: React.FC<{
  user: UserState;
  finishDay: (log: WorkoutLog) => void;
  abortWorkout: () => void;
  updateProgress: (exercises: ActiveExerciseState[], timer: number, dayIndex: number) => void;
}> = ({ 
  user,
  finishDay,
  abortWorkout,
  updateProgress
}) => {
  const activeProgData = user.activeProgram;
  const program = PROGRAMS.find(p => p.id === activeProgData?.programId);
  const currentDayIndex = activeProgData?.currentDayIndex || 0;
  const dayData = program?.schedule[currentDayIndex];
  
  const [exercises, setExercises] = useState<ActiveExerciseState[]>([]);
  const [timer, setTimer] = useState(0);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null); // New state for modal
  
  const exercisesRef = useRef(exercises);
  const timerRef = useRef(timer);

  useEffect(() => { exercisesRef.current = exercises; }, [exercises]);
  useEffect(() => { timerRef.current = timer; }, [timer]);

  useEffect(() => {
    if (!dayData) return;
    if (activeProgData?.currentDayLog && activeProgData.currentDayLog.exercises.length > 0) {
      setExercises(activeProgData.currentDayLog.exercises);
      setTimer(activeProgData.currentDayLog.timer);
    } else {
      const initialExercises: ActiveExerciseState[] = dayData.exercises.map(template => ({
        ...template,
        isFullyCompleted: false,
        setsLog: Array.from({ length: template.targetSets }).map((_, i) => ({
          setNumber: i + 1,
          weight: 0,
          reps: 0,
          completed: false
        }))
      }));
      setExercises(initialExercises);
      setTimer(0);
    }
  }, [dayData?.id, activeProgData?.startedAt]); 

  useEffect(() => {
    const interval = setInterval(() => { setTimer(t => t + 1); }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const saveState = () => {
      if (exercisesRef.current.length > 0) {
        updateProgress(exercisesRef.current, timerRef.current, currentDayIndex);
      }
    };
    const intervalId = setInterval(saveState, 10000);
    return () => {
      clearInterval(intervalId);
      saveState();
    };
  }, [updateProgress, currentDayIndex]);

  if (!program || !dayData) return <div className="p-4 text-white">Error cargando entrenamiento.</div>;

  const handleSaveSets = (setsLog: SetLog[]) => {
    if (selectedExerciseIndex === null) return;
    
    const newExs = [...exercises];
    newExs[selectedExerciseIndex].setsLog = setsLog;
    // Check completion status based on sets
    // A set is 'complete' if it has reps > 0 (handled in modal). 
    // Exercise is complete if all intended sets have data.
    const completedSetsCount = setsLog.filter(s => s.completed).length;
    newExs[selectedExerciseIndex].isFullyCompleted = completedSetsCount >= newExs[selectedExerciseIndex].targetSets;
    
    setExercises(newExs);
    updateProgress(newExs, timer, currentDayIndex);
    setSelectedExerciseIndex(null); // Close modal
  };

  const tryFinishWorkout = () => {
    const allComplete = exercises.every(ex => ex.isFullyCompleted);
    if (!allComplete) {
      const confirmFinish = window.confirm("No has completado todos los ejercicios. ¿Terminar de todas formas?");
      if (!confirmFinish) return;
    }

    const totalVol = exercises.reduce((acc, ex) => acc + ex.setsLog.reduce((sAcc, set) => sAcc + (set.weight * set.reps), 0), 0);
    const totalSets = exercises.reduce((acc, ex) => acc + ex.setsLog.filter(s => s.completed).length, 0);
    const totalReps = exercises.reduce((acc, ex) => acc + ex.setsLog.reduce((sAcc, set) => sAcc + (set.completed ? set.reps : 0), 0), 0);
    const durationMinutes = Math.max(1, Math.round(timer / 60));
    const avgKcalPerSession = Math.round(program.estimatedKcal / program.schedule.length);

    finishDay({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      programTitle: program.title,
      dayTitle: dayData.title,
      durationMinutes: durationMinutes,
      totalVolume: totalVol,
      totalSets,
      totalReps,
      xpEarned: program.xpRewardDay,
      kcalBurned: avgKcalPerSession
    });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    // const secs = s % 60; // Not needed for clean display in screenshot style usually, but lets keep minutes
    return `${mins} min`;
  };

  // --- Render Modal if Active ---
  if (selectedExerciseIndex !== null) {
    return (
      <ExerciseLoggerModal 
        exercise={exercises[selectedExerciseIndex]}
        onSave={handleSaveSets}
        onClose={() => setSelectedExerciseIndex(null)}
      />
    );
  }

  // --- Render Main List (Screenshot 3 style) ---
  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 animate-fade-in relative">
      
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
         <button onClick={abortWorkout} className="flex items-center text-primary-500 font-bold">
            <ChevronLeft className="w-6 h-6" /> Atrás
         </button>
         <div className="text-white font-bold">{/* Optional Center Title */}</div>
         <div className="w-6"></div> {/* Spacer */}
      </div>

      {/* Header Content */}
      <div className="px-4 mb-6">
         <h1 className="text-3xl font-black text-white mb-4">{dayData.title}</h1>
         
         <div className="flex items-center gap-6 text-sm font-bold text-white mb-6">
            <div className="flex items-center gap-2">
               <Clock className="w-5 h-5 text-primary-500" />
               <span>{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2">
               <Flame className="w-5 h-5 text-primary-500" />
               <span>489 kcal</span> {/* Hardcoded/Estimated for visual match */}
            </div>
            <div className="flex items-center gap-2">
               <Dumbbell className="w-5 h-5 text-primary-500" />
               <span>{exercises.reduce((acc,ex) => acc + ex.setsLog.reduce((s, set) => s + set.weight * set.reps, 0), 0)} kg</span>
            </div>
         </div>

         <button 
           onClick={tryFinishWorkout}
           className="w-full bg-primary-500 text-white font-bold py-4 rounded-full shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
         >
           Terminar Entrenamiento
         </button>
      </div>

      {/* Exercises List Header */}
      <div className="px-4 flex justify-between items-center mb-4">
         <h2 className="text-xl font-bold text-white">Ejercicios</h2>
         <button className="text-primary-500 font-bold text-sm">Añadir</button>
      </div>

      {/* Exercises List */}
      <div className="px-4 space-y-3">
         {exercises.map((ex, idx) => (
           <div 
             key={ex.id}
             onClick={() => setSelectedExerciseIndex(idx)}
             className="bg-slate-800 rounded-xl p-3 flex items-center gap-4 active:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
           >
              {/* Image */}
              <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0">
                 <ImageWithFallback src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                 <h3 className="font-bold text-white text-md leading-tight mb-1 truncate">{ex.name}</h3>
                 <p className="text-slate-400 text-sm mb-2">
                    {ex.setsLog.length} series • {ex.targetReps} reps • {ex.setsLog[0]?.weight || 0} kg
                 </p>
                 <span className="text-primary-500 text-[10px] uppercase font-bold tracking-wider bg-primary-500/10 px-2 py-1 rounded">high load</span>
              </div>

              {/* Status Icon */}
              <div className="pr-2">
                 {ex.isFullyCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                       <Check className="w-4 h-4 text-white" />
                    </div>
                 ) : (
                    <ChevronRight className="text-slate-500" />
                 )}
              </div>
           </div>
         ))}
      </div>

    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<UserState>(INITIAL_USER_STATE);
  const [view, setView] = useState<ViewState>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState<{show: boolean, level: number}>({show: false, level: 0});
  const [showConfirmAbort, setShowConfirmAbort] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
      else {
        setUser(INITIAL_USER_STATE);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_progress')
      .select('state')
      .eq('user_id', userId)
      .single();

    if (data?.state) {
      setUser(data.state);
    } else {
      saveUserData(userId, INITIAL_USER_STATE);
    }
    setLoading(false);
  };

  const saveUserData = async (userId: string, state: UserState) => {
    await supabase.from('user_progress').upsert({
      user_id: userId,
      state: state
    });
  };

  const updateUser = (newState: UserState) => {
    setUser(newState);
    if (session?.user?.id) {
      saveUserData(session.user.id, newState);
    }
  };

  useEffect(() => {
    if (user.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.settings.darkMode]);

  const checkLevelUp = (newUser: UserState) => {
    if (newUser.currentXP >= newUser.nextLevelXP) {
      const remainder = newUser.currentXP - newUser.nextLevelXP;
      const newLevel = newUser.level + 1;
      const newNextXP = Math.floor(newUser.nextLevelXP * 1.2);
      
      const leveledUser = {
        ...newUser,
        level: newLevel,
        currentXP: remainder,
        nextLevelXP: newNextXP
      };
      
      setShowLevelUp({ show: true, level: newLevel });
      return leveledUser;
    }
    return newUser;
  };

  const checkAchievements = (u: UserState): UserState => {
    const newUnlocked: string[] = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!u.achievements.includes(ach.id) && ach.condition(u)) {
        newUnlocked.push(ach.id);
      }
    });

    if (newUnlocked.length > 0) {
      return { ...u, achievements: [...u.achievements, ...newUnlocked] };
    }
    return u;
  };

  const handleStartProgram = (prog: Program) => {
    const newState: UserState = {
      ...user,
      activeProgram: {
        programId: prog.id,
        currentDayIndex: 0,
        startedAt: new Date().toISOString()
      }
    };
    updateUser(newState);
    setView('active-workout');
  };

  const handleContinueProgram = () => {
    setView('active-workout');
  };

  const handleAbortProgram = () => {
     setShowConfirmAbort(true);
  };

  const confirmAbort = () => {
    const newState = { ...user, activeProgram: null };
    updateUser(newState);
    setShowConfirmAbort(false);
  };

  const handleUpdateActiveProgress = useCallback((exercises: ActiveExerciseState[], timer: number, dayIndex: number) => {
     setUser(prev => {
       if (!prev.activeProgram) return prev;
       const newProgState: ActiveProgramProgress = {
         ...prev.activeProgram,
         currentDayLog: {
           timer,
           exercises
         }
       };
       const newState = { ...prev, activeProgram: newProgState };
       
       if (session?.user?.id) {
          saveUserData(session.user.id, newState); 
       }
       return newState;
     });
  }, [session?.user?.id]);

  const handleFinishDay = (log: WorkoutLog) => {
    let nextUser = { ...user };
    
    nextUser.history = [...nextUser.history, log];
    nextUser.completedWorkouts += 1;
    nextUser.totalWeightLifted += log.totalVolume;
    nextUser.totalDurationMinutes = (nextUser.totalDurationMinutes || 0) + log.durationMinutes;
    // Update total kcal burnt if log has it
    if (log.kcalBurned) {
      nextUser.totalKcalBurned = (nextUser.totalKcalBurned || 0) + log.kcalBurned;
    }
    nextUser.currentXP += log.xpEarned;
    
    if (nextUser.activeProgram) {
      const prog = PROGRAMS.find(p => p.id === nextUser.activeProgram!.programId);
      if (prog) {
        const nextDayIndex = nextUser.activeProgram.currentDayIndex + 1;
        if (nextDayIndex >= prog.schedule.length) {
          nextUser.activeProgram = null;
          nextUser.completedProgramIds = [...nextUser.completedProgramIds, prog.id];
          nextUser.currentXP += prog.xpRewardFinish;
        } else {
          nextUser.activeProgram = {
            ...nextUser.activeProgram,
            currentDayIndex: nextDayIndex,
            currentDayLog: undefined
          };
        }
      }
    }

    nextUser = checkLevelUp(nextUser);
    nextUser = checkAchievements(nextUser);

    updateUser(nextUser);
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans selection:bg-primary-500/30">
      <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white/50 dark:bg-slate-900/50">
        <div className={view === 'active-workout' ? '' : 'p-4 pt-6'}>
           {view === 'dashboard' && <DashboardView user={user} setView={setView} />}
           {view === 'training' && (
             <ProgramsView 
               user={user} 
               startProgram={handleStartProgram} 
               continueProgram={handleContinueProgram}
               abandonProgram={handleAbortProgram}
             />
           )}
           {view === 'achievements' && <AchievementsView user={user} />}
           {view === 'stats' && <StatsView user={user} setUser={updateUser} />}
           {view === 'profile' && (
             <ProfileView 
               user={user} 
               setUser={updateUser} 
               toggleTheme={() => updateUser({...user, settings: { ...user.settings, darkMode: !user.settings.darkMode }})}
               signOut={() => supabase.auth.signOut()}
             />
           )}
           {view === 'active-workout' && (
             <ActiveWorkoutView 
               user={user}
               finishDay={handleFinishDay}
               abortWorkout={() => setView('dashboard')}
               updateProgress={handleUpdateActiveProgress}
             />
           )}
        </div>

        {view !== 'active-workout' && (
          <nav className="fixed bottom-6 left-4 right-4 z-50 max-w-[400px] mx-auto pb-safe">
            <div className="liquid-glass rounded-3xl flex justify-around items-center h-20 px-2 shadow-2xl backdrop-blur-xl border border-white/40 dark:border-white/5">
              <NavButton icon={Home} label="Inicio" isActive={view === 'dashboard'} onClick={() => setView('dashboard')} />
              <NavButton icon={Dumbbell} label="Entrenar" isActive={view === 'training'} onClick={() => setView('training')} />
              <NavButton icon={BarChart2} label="Stats" isActive={view === 'stats'} onClick={() => setView('stats')} />
              <NavButton icon={Trophy} label="Logros" isActive={view === 'achievements'} onClick={() => setView('achievements')} />
              <NavButton icon={User} label="Perfil" isActive={view === 'profile'} onClick={() => setView('profile')} />
            </div>
          </nav>
        )}
      </main>

      {showLevelUp.show && (
        <LevelUpModal 
          level={showLevelUp.level} 
          onClose={() => setShowLevelUp({show: false, level: 0})} 
        />
      )}

      <ConfirmationModal 
        isOpen={showConfirmAbort}
        title="¿Abandonar Programa?"
        message="Perderás el progreso del programa actual. Esta acción no se puede deshacer."
        onConfirm={confirmAbort}
        onCancel={() => setShowConfirmAbort(false)}
      />
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

export default App;