import React from 'react';
import { Zap, Trophy, Activity, ArrowRight, Brain, Shield } from 'lucide-react';

export const WelcomeView = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Hero Section */}
        <div className="mb-10 text-center w-full max-w-md mx-auto flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/30 animate-bounce-in">
            <Zap className="w-12 h-12 text-white fill-current" />
          </div>
          
          {/* App Name */}
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-center flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
            <span>LevelUp</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse">Fitness</span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-xs mx-auto leading-relaxed text-center">
            Convierte tu entrenamiento en un juego RPG. Sube de nivel en la vida real.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 w-full max-w-sm mb-12">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Gamificación RPG</h3>
              <p className="text-xs text-slate-400">Gana XP y desbloquea logros.</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Estadísticas Pro</h3>
              <p className="text-xs text-slate-400">Control total de tu progreso.</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Coach IA</h3>
              <p className="text-xs text-slate-400">Consejos inteligentes personalizados.</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full max-w-xs bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 group border border-white/10"
        >
          COMENZAR AVENTURA
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
          v1.0
        </p>
      </div>
    </div>
  );
};