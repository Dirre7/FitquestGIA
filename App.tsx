import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Trophy, Activity, User, BarChart2, Home, Lock, CheckCircle, Play, 
  Zap, Dumbbell, Clock, ChevronRight, Sun, Moon, Cloud, X, Star, 
  Maximize2, Medal, Award, Calendar, Repeat, Flame, RefreshCw, Trash2,
  Hash, Timer, TrendingUp, LogOut, Loader2, Sparkles, MessageSquare, Bot,
  Camera, Image as ImageIcon, Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from './services/supabaseClient';
import { getAiCoachAdvice } from './services/geminiService';
import { AuthView } from './components/AuthView';
import { INITIAL_USER_STATE, PROGRAMS, ACHIEVEMENTS } from './constants';
import { UserState, Program, ViewState, ActiveExerciseState, WorkoutLog, ActiveProgramProgress, SetLog } from './types';

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
  
  // Estilo "Adventurer" de DiceBear
  const seeds = [
    'Felix', 'Aneka', 'Zack', 'Midnight', 'Luna', 'Shadow', 
    'Buddy', 'Giggle', 'Bandit', 'Whiskers', 'Leo', 'Willow'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-bounce-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Elige tu Avatar</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 mb-4 flex-1">
          <p className="text-sm text-slate-500 mb-3 font-bold">Héroes Predefinidos</p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {seeds.map(seed => {
              const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              return (
                <button 
                  key={seed}
                  onClick={() => { onSelect(url); onClose(); }}
                  className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary-500 hover:scale-105 transition-all bg-slate-100 dark:bg-slate-700"
                >
                  <ImageWithFallback src={url} alt={seed} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-sm text-slate-500 mb-2 font-bold">O usa una URL personalizada</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-primary-500 outline-none"
                />
              </div>
              <button 
                onClick={() => { if(customUrl) { onSelect(customUrl); onClose(); } }}
                disabled={!customUrl}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-primary-500"
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
      {/* Active Program Banner */}
      {activeProgram && activeProgress ? (
         <div 
          onClick={() => setView('training')}
          className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl shadow-primary-900/20 cursor-pointer group"
        >
          {/* Background Gradient & Decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-slate-900 opacity-90 z-0"></div>
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

      {/* Profile Summary */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
        <div className="relative shrink-0">
          <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary-500 object-cover bg-slate-200" />
          <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Lvl {user.level}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{user.name}</h3>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>XP Actual</span>
            <span>{user.currentXP}/{user.nextLevelXP}</span>
          </div>
          <ProgressBar current={user.currentXP} max={user.nextLevelXP} />
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
  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      <h2 className="text-2xl font-bold px-1">Programas Disponibles</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {PROGRAMS.map(prog => {
          const isActive = user.activeProgram?.programId === prog.id;
          const isLocked = user.activeProgram && !isActive; // Lock others if one is active

          return (
            <div key={prog.id} className={`glass-card rounded-2xl overflow-hidden relative transition-all duration-300 ${isLocked ? 'opacity-60 grayscale' : 'hover:shadow-xl'}`}>
              {/* Header Image/Color */}
              <div className={`h-32 relative ${
                prog.difficulty === 'Principiante' ? 'bg-emerald-800' :
                prog.difficulty === 'Intermedio' ? 'bg-blue-800' : 'bg-red-900'
              }`}>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-white font-bold text-xl shadow-sm">{prog.title}</h3>
                    <div className="flex gap-2">
                       <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded backdrop-blur-md uppercase font-bold">
                        {prog.location}
                      </span>
                      <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded backdrop-blur-md uppercase font-bold">
                        {prog.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">{prog.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {prog.durationWeeks} Semanas
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat className="w-4 h-4" />
                    {prog.daysPerWeek} días/sem
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Zap className="w-4 h-4" />
                    +{prog.xpRewardFinish} XP Final
                  </div>
                </div>

                <div className="pt-2">
                  {isActive ? (
                    <div className="space-y-3">
                      <button 
                        onClick={continueProgram}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse"
                      >
                        <Play className="w-5 h-5" fill="currentColor" />
                        CONTINUAR PROGRAMA
                      </button>
                      <button 
                        onClick={abandonProgram}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 py-2 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Abandonar programa actual
                      </button>
                    </div>
                  ) : isLocked ? (
                    <button disabled className="w-full bg-slate-200 dark:bg-slate-700 text-slate-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                      <Lock className="w-4 h-4" />
                      OTRO PROGRAMA ACTIVO
                    </button>
                  ) : (
                    <button 
                      onClick={() => startProgram(prog)}
                      className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      Comenzar Aventura
                    </button>
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

const AchievementsView = ({ user }: { user: UserState }) => {
  const unlockedIds = user.achievements || [];
  
  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold">Salón de la Fama</h2>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200 dark:border-yellow-700">
          {unlockedIds.length} / {ACHIEVEMENTS.length}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ACHIEVEMENTS.map(ach => {
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

const StatsView = ({ user }: { user: UserState }) => {
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
    
    return { totalMinutes, totalXP, totalSets, totalReps };
  }, [user.history, user.totalDurationMinutes]);

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
          icon={Repeat} 
          title="Repeticiones" 
          value={historyStats.totalReps > 1000 ? `${(historyStats.totalReps/1000).toFixed(1)}k` : historyStats.totalReps} 
          sub="Movimientos"
          colorClass="bg-pink-500 text-pink-500"
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

const ProfileView = ({ 
  user, 
  setUser, 
  toggleTheme,
  signOut
}: { 
  user: UserState; 
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  toggleTheme: () => void;
  signOut: () => void;
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold px-1">Perfil</h2>
      
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex flex-col items-center relative">
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
            <div className="w-24 h-24 rounded-full border-4 border-primary-500 mb-4 bg-slate-200 overflow-hidden relative group-hover:brightness-75 transition-all">
                <ImageWithFallback src={user.avatar} alt="profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mb-4">
              <Camera className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-0 right-0 bg-primary-600 rounded-full p-1.5 border-2 border-white dark:border-slate-800 mb-4">
               <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <input 
            value={user.name} 
            onChange={(e) => setUser({...user, name: e.target.value})}
            className="text-center font-bold text-xl bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:outline-none transition-colors"
          />
          <span className="text-slate-500 text-sm mt-1">Guerrero Nivel {user.level}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={toggleTheme} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
            {user.settings.darkMode ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
            <span className="text-sm font-medium">Tema</span>
          </button>
          <button onClick={signOut} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
            <LogOut className="w-5 h-5"/>
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
        
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-400">Tus datos se guardan en la nube automáticamente.</p>
        </div>
      </div>

      <h3 className="text-lg font-bold px-1">Historial de Batallas</h3>
      <div className="space-y-3">
        {(user.history || []).length === 0 ? (
          <div className="text-slate-400 text-center py-8 flex flex-col items-center">
            <Activity className="w-12 h-12 mb-2 opacity-20" />
            <p>No hay entrenamientos aún.</p>
          </div>
        ) : (
          (user.history || []).map(log => (
            <div key={log.id} className="glass-card p-4 rounded-xl flex justify-between items-center transition-transform hover:scale-[1.01]">
              <div>
                <h4 className="font-bold text-sm">{log.programTitle}</h4>
                <div className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">{log.dayTitle}</div>
                <div className="text-xs text-slate-500 flex space-x-3">
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {log.durationMinutes} min</span>
                  <span className="flex items-center"><Dumbbell className="w-3 h-3 mr-1"/> {log.totalVolume} kg</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold">+{log.xpEarned} XP</span>
                <div className="text-[10px] text-slate-400">{new Date(log.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Avatar Modal */}
      <AvatarSelectionModal 
        isOpen={showAvatarModal} 
        onClose={() => setShowAvatarModal(false)}
        onSelect={(url) => setUser({...user, avatar: url})}
      />
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

  // Derivar el día actual
  const currentDayIndex = activeProgData?.currentDayIndex || 0;
  const dayData = program?.schedule[currentDayIndex];
  
  // State Local para la sesión
  const [exercises, setExercises] = useState<ActiveExerciseState[]>([]);
  const [timer, setTimer] = useState(0);
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  // Use refs to track latest state for interval saving without re-running effects
  const exercisesRef = useRef(exercises);
  const timerRef = useRef(timer);

  // Sync refs with state
  useEffect(() => { exercisesRef.current = exercises; }, [exercises]);
  useEffect(() => { timerRef.current = timer; }, [timer]);

  // Inicializar estado (o recuperar del log guardado)
  useEffect(() => {
    if (!dayData) return;

    // Si tenemos un log parcial válido y reciente, lo usamos
    if (activeProgData?.currentDayLog && activeProgData.currentDayLog.exercises.length > 0) {
      setExercises(activeProgData.currentDayLog.exercises);
      setTimer(activeProgData.currentDayLog.timer);
    } else {
      // Inicializar desde cero (nuevo día o nuevo programa)
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
      // Expandir el primero automáticamente
      if(initialExercises.length > 0) setExpandedEx(initialExercises[0].id);
      else setExpandedEx(null);
      setTimer(0);
    }
  }, [dayData?.id, activeProgData?.startedAt]); 

  // Timer: Runs every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ROBUST AUTO-SAVE: Runs every 10 seconds
  useEffect(() => {
    const saveState = () => {
      if (exercisesRef.current.length > 0) {
        // Pass currentDayIndex to validate saving in parent
        updateProgress(exercisesRef.current, timerRef.current, currentDayIndex);
      }
    };

    const intervalId = setInterval(saveState, 10000);

    // Save on unmount/cleanup to ensure latest state is captured when leaving the view
    return () => {
      clearInterval(intervalId);
      saveState();
    };
  }, [updateProgress, currentDayIndex]); // updateProgress is stable via useCallback in App


  if (!program || !dayData) return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="text-red-500 mb-4"><X className="w-12 h-12" /></div>
      <h3 className="text-xl font-bold mb-2">Error de Programa</h3>
      <p className="text-slate-500 mb-4">No se pudo cargar la información del entrenamiento activo.</p>
      <button onClick={abortWorkout} className="px-6 py-2 bg-slate-200 rounded-lg font-bold">Volver</button>
    </div>
  );

  const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const newExs = [...exercises];
    newExs[exIndex].setsLog[setIndex] = {
      ...newExs[exIndex].setsLog[setIndex],
      [field]: value
    };
    setExercises(newExs);
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    const newExs = [...exercises];
    const currentSet = newExs[exIndex].setsLog[setIndex];
    
    // Validar input básico
    if (!currentSet.completed && (currentSet.reps === 0)) {
      alert("Introduce las repeticiones realizadas antes de marcar la serie.");
      return;
    }

    currentSet.completed = !currentSet.completed;
    
    // Check if exercise is fully complete
    newExs[exIndex].isFullyCompleted = newExs[exIndex].setsLog.every(s => s.completed);
    
    // Auto-expand next exercise if complete
    if (newExs[exIndex].isFullyCompleted && exIndex < newExs.length - 1 && currentSet.completed) {
      setExpandedEx(newExs[exIndex + 1].id);
    }

    setExercises(newExs);
    // Immediate save on interaction
    updateProgress(newExs, timer, currentDayIndex);
  };

  const tryFinishWorkout = () => {
    const allComplete = exercises.every(ex => ex.isFullyCompleted);
    if (!allComplete) {
      alert("Debes completar todas las series de todos los ejercicios para terminar el día.");
      return;
    }

    const totalVol = exercises.reduce((acc, ex) => {
      return acc + ex.setsLog.reduce((sAcc, set) => sAcc + (set.weight * set.reps), 0);
    }, 0);

    const totalSets = exercises.reduce((acc, ex) => {
      return acc + ex.setsLog.filter(s => s.completed).length;
    }, 0);

    const totalReps = exercises.reduce((acc, ex) => {
      return acc + ex.setsLog.reduce((sAcc, set) => sAcc + (set.completed ? set.reps : 0), 0);
    }, 0);

    // IMPROVED TIME CALCULATION: Ensure at least 1 minute is logged if any time passed
    // Old: Math.floor(timer/60) -> 59s became 0 min
    // New: Math.max(1, Math.round(timer/60)) -> 30s+ becomes 1 min, <30s becomes 1 min (minimum effort rewarded)
    const durationMinutes = Math.max(1, Math.round(timer / 60));

    finishDay({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      programTitle: program.title,
      dayTitle: dayData.title,
      durationMinutes: durationMinutes,
      totalVolume: totalVol,
      totalSets,
      totalReps,
      xpEarned: program.xpRewardDay
    });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-4 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 flex items-center justify-between z-10 border border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{program.title}</h2>
          <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none">{dayData.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-xl font-bold text-primary-600">{formatTime(timer)}</div>
          <button onClick={abortWorkout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Exercises Content */}
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => {
          const isExpanded = expandedEx === ex.id;
          return (
            <div key={ex.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-l-4 transition-all duration-300 ${ex.isFullyCompleted ? 'border-green-500 opacity-80' : 'border-primary-500'}`}>
              
              {/* Card Header */}
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedEx(isExpanded ? null : ex.id)}
              >
                {/* Miniatura solo cuando está cerrado, para no duplicar */}
                {!isExpanded && (
                  <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                    <ImageWithFallback src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg truncate ${ex.isFullyCompleted ? 'text-green-600 line-through' : ''}`}>{ex.name}</h3>
                  <div className="text-xs text-slate-500 flex gap-2">
                    <span>{ex.setsLog.filter(s => s.completed).length}/{ex.targetSets} Series</span>
                    <span>• Meta: {ex.targetReps} reps</span>
                  </div>
                </div>
                <div>
                   {ex.isFullyCompleted ? <CheckCircle className="w-6 h-6 text-green-500" /> : <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700">
                   
                   {/* Description & Image Section - Fondo adaptativo y texto legible */}
                   <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-6 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner">
                     <div className="sm:w-1/3 flex items-center justify-center rounded-lg min-h-[160px] overflow-hidden bg-black/5 dark:bg-black/20">
                        <ImageWithFallback src={ex.image} alt={ex.name} className="w-full h-40 object-cover rounded-lg" fallbackText={ex.name} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-primary-500" />
                          <h4 className="font-bold text-sm text-primary-600 dark:text-primary-400 uppercase tracking-wide">Técnica</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ex.description}</p>
                     </div>
                   </div>

                   {/* Sets Table */}
                   <div className="grid grid-cols-10 gap-2 mb-2 text-[10px] uppercase font-bold text-slate-400 text-center">
                     <div className="col-span-2">Serie</div>
                     <div className="col-span-3">Kg</div>
                     <div className="col-span-3">Reps</div>
                     <div className="col-span-2">Hecho</div>
                   </div>
                   
                   <div className="space-y-2">
                     {ex.setsLog.map((set, sIdx) => (
                       <div key={sIdx} className={`grid grid-cols-10 gap-2 items-center ${set.completed ? 'opacity-50' : ''}`}>
                         <div className="col-span-2 flex justify-center">
                           <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                             {set.setNumber}
                           </div>
                         </div>
                         <div className="col-span-3">
                           <input 
                              type="number" 
                              placeholder="0"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded p-2 text-center font-mono text-sm focus:border-primary-500 outline-none"
                              value={set.weight || ''}
                              onChange={(e) => handleSetChange(exIdx, sIdx, 'weight', Number(e.target.value))}
                              disabled={set.completed}
                           />
                         </div>
                         <div className="col-span-3">
                            <input 
                              type="number" 
                              placeholder="0"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded p-2 text-center font-mono text-sm focus:border-primary-500 outline-none"
                              value={set.reps || ''}
                              onChange={(e) => handleSetChange(exIdx, sIdx, 'reps', Number(e.target.value))}
                              disabled={set.completed}
                           />
                         </div>
                         <div className="col-span-2 flex justify-center">
                           <button 
                            onClick={() => toggleSetComplete(exIdx, sIdx)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${set.completed ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 hover:bg-slate-300'}`}
                           >
                             <CheckCircle className="w-5 h-5" />
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <button 
          onClick={tryFinishWorkout}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Award className="w-6 h-6" />
          TERMINAR ENTRENAMIENTO
        </button>
      </div>
    </div>
  );
};

// --- App Component ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // --- State Initialization ---
  const [user, setUser] = useState<UserState>(INITIAL_USER_STATE);

  const [view, setView] = useState<ViewState>('dashboard');
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmation, setConfirmation] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);

  // --- Supabase Auth & Data Sync ---

  useEffect(() => {
    // 1. Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      setAuthLoading(false);
    });

    // 2. Escuchar cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setUser(INITIAL_USER_STATE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('state')
        .eq('user_id', userId)
        .single();

      if (data?.state) {
        setUser(data.state);
      } else {
        // Si no existe, creamos el registro inicial
        await saveUserData(INITIAL_USER_STATE);
        setUser(INITIAL_USER_STATE);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const saveUserData = async (newState: UserState) => {
    if (!session?.user?.id) return;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({ 
          user_id: session.user.id, 
          state: newState,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  // Debounced save when user state changes
  useEffect(() => {
    if (!session) return;
    
    // Theme application immediately
    if (user.settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // Save to DB
    const timeout = setTimeout(() => {
      saveUserData(user);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeout);
  }, [user, session]);


  // --- Actions ---

  const checkAchievements = useCallback(() => {
    setUser(prev => {
      const newAchievements = [...(prev.achievements || [])];
      let changed = false;

      ACHIEVEMENTS.forEach(ach => {
        if (!newAchievements.includes(ach.id) && ach.condition(prev)) {
          newAchievements.push(ach.id);
          changed = true;
          setShowConfetti(true);
        }
      });

      if (!changed) return prev;
      return { ...prev, achievements: newAchievements };
    });
  }, []);

  useEffect(() => {
    checkAchievements();
  }, [user.completedWorkouts, user.level, user.totalWeightLifted, user.history, user.completedProgramIds, checkAchievements]);

  const addXP = (amount: number) => {
    setUser(prev => {
      let newXP = prev.currentXP + amount;
      let newLevel = prev.level;
      let newNext = prev.nextLevelXP;
      let leveled = false;
      while(newXP >= newNext) {
        newXP -= newNext;
        newLevel++;
        newNext = Math.floor(newNext * 1.2);
        leveled = true;
      }
      if (leveled) {
        setTimeout(() => setShowLevelUp(newLevel), 500);
      }
      return { ...prev, level: newLevel, currentXP: newXP, nextLevelXP: newNext };
    });
  };

  const startProgram = (prog: Program) => {
    const startTimestamp = new Date().toISOString();
    setUser(prev => ({
      ...prev,
      activeProgram: {
        programId: prog.id,
        currentDayIndex: 0,
        startedAt: startTimestamp, // This timestamp forces reset in ActiveWorkoutView
        currentDayLog: undefined // Clear any previous logs
      }
    }));
    setView('active-workout');
  };

  const abandonProgram = () => {
    setConfirmation({
      isOpen: true,
      title: "¿Abandonar Misión?",
      message: "Perderás el progreso de este programa, pero conservarás tu historial y XP ganada. ¿Estás seguro de retirarte?",
      onConfirm: () => {
        setUser(prev => ({ ...prev, activeProgram: null }));
        setConfirmation(null);
      }
    });
  };

  const updateWorkoutProgress = useCallback((exercises: ActiveExerciseState[], timer: number, dayIndex: number) => {
    setUser(prev => {
      if (!prev.activeProgram) return prev;
      // Guard clause: If the update comes from a previous day (race condition/cleanup), ignore it
      if (prev.activeProgram.currentDayIndex !== dayIndex) return prev; 
      
      return {
        ...prev,
        activeProgram: {
          ...prev.activeProgram,
          currentDayLog: { exercises, timer }
        }
      };
    });
  }, []);

  const toggleTheme = () => {
    setUser(prev => ({
      ...prev,
      settings: { ...prev.settings, darkMode: !prev.settings.darkMode }
    }));
  };

  const finishDay = (log: WorkoutLog) => {
    if (!user.activeProgram) return;

    const activeProgId = user.activeProgram.programId;
    const program = PROGRAMS.find(p => p.id === activeProgId);
    
    if (!program) return;

    // Calculate if program is complete based on current state
    const currentDayIdx = user.activeProgram.currentDayIndex;
    const isProgramComplete = (currentDayIdx + 1) >= program.schedule.length;

    setUser(prev => {
      if (!prev.activeProgram) return prev;

      const nextDayIdx = prev.activeProgram.currentDayIndex + 1;
      let newHistory = [log, ...prev.history];
      
      // Update State
      let newState = {
        ...prev,
        completedWorkouts: prev.completedWorkouts + 1,
        totalWeightLifted: prev.totalWeightLifted + log.totalVolume,
        totalDurationMinutes: (prev.totalDurationMinutes || 0) + log.durationMinutes, // Explicitly accumulate time
        history: newHistory,
        // Reset active program if done, else increment day and clear log
        activeProgram: isProgramComplete ? null : {
          ...prev.activeProgram!,
          currentDayIndex: nextDayIdx,
          currentDayLog: undefined // Clear temp log for next day
        }
      };

      if (isProgramComplete) {
        newState.completedProgramIds = [...prev.completedProgramIds, program.id];
        setTimeout(() => alert(`¡ENHORABUENA! Has completado el programa "${program.title}". \n¡Recibes una recompensa masiva de XP!`), 500);
      }

      return newState;
    });

    addXP(isProgramComplete ? (program.xpRewardFinish + log.xpEarned) : log.xpEarned);
    setView('dashboard');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  // --- Render Logic ---
  
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <p className="animate-pulse">Sincronizando con la base de datos...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  // Safety check for active program view
  const isWorkoutViewValid = view === 'active-workout' && user.activeProgram !== null;
  // If we are in workout view but have no program, fallback to dashboard
  if (view === 'active-workout' && !user.activeProgram) {
     // Side effect in render is bad practice usually, but for this strict view switch it's acceptable if handled carefully,
     // or better, handle it via useEffect or just render dashboard content.
     // We will just let the render block below handle logic or useEffect above.
     // For safety, we force view change via component logic if we were using routing, but here state is sync.
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {showConfetti && <Confetti />}
      {showLevelUp && <LevelUpModal level={showLevelUp} onClose={() => setShowLevelUp(null)} />}
      
      {confirmation && (
        <ConfirmationModal 
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-secondary-500/10 rounded-full blur-[100px]" />
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-24">
        {isWorkoutViewValid ? (
          <ActiveWorkoutView 
            key={user.activeProgram?.currentDayIndex ?? 'active-workout'} // Force remount on day change
            user={user} 
            finishDay={finishDay} 
            abortWorkout={() => setView('training')}
            updateProgress={updateWorkoutProgress}
          />
        ) : (
          <>
            {(view === 'dashboard' || (view === 'active-workout' && !user.activeProgram)) && <DashboardView user={user} setView={setView} />}
            {view === 'training' && <ProgramsView user={user} startProgram={startProgram} continueProgram={() => setView('active-workout')} abandonProgram={abandonProgram} />}
            {view === 'achievements' && <AchievementsView user={user} />}
            {view === 'stats' && <StatsView user={user} />}
            {view === 'profile' && <ProfileView user={user} setUser={setUser} toggleTheme={toggleTheme} signOut={() => supabase.auth.signOut()} />}
          </>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-full px-6 py-3 flex gap-6 md:gap-8 z-40">
        <NavBtn icon={Home} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <NavBtn icon={Dumbbell} active={view === 'training' || view === 'active-workout'} onClick={() => setView('training')} />
        <NavBtn icon={BarChart2} active={view === 'stats'} onClick={() => setView('stats')} />
        <NavBtn icon={Award} active={view === 'achievements'} onClick={() => setView('achievements')} />
        <NavBtn icon={User} active={view === 'profile'} onClick={() => setView('profile')} />
      </nav>
    </div>
  );
}

const NavBtn = ({ icon: Icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-2 rounded-full transition-all ${active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400 hover:text-primary-500'}`}>
    <Icon className="w-6 h-6" strokeWidth={2.5} />
  </button>
);