export enum Difficulty {
  BEGINNER = 'Principiante',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado',
  CHALLENGE = 'Desafío',
}

export type LocationType = 'Casa' | 'Gimnasio';

// Configuración del ejercicio dentro de un programa (la plantilla)
export interface ExerciseTemplate {
  id: string;
  name: string;
  image: string;
  description: string; // Nueva explicación técnica
  targetSets: number;
  targetReps: string; // "10-12", "15", "Al fallo"
  restSeconds: number;
}

// Datos que introduce el usuario para cada serie
export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

// Estado del ejercicio durante el entrenamiento activo
export interface ActiveExerciseState extends ExerciseTemplate {
  setsLog: SetLog[];
  isFullyCompleted: boolean;
}

export interface ProgramDay {
  id: string;
  title: string; // "Día 1: Pecho y Tríceps"
  exercises: ExerciseTemplate[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  location: LocationType;
  durationWeeks: number;
  daysPerWeek: number;
  // Estructura simplificada: Array plano de todos los días de entrenamiento del programa
  // Ejemplo: Si dura 4 semanas y son 3 días/sem, habrá 12 días en este array.
  schedule: ProgramDay[]; 
  xpRewardFinish: number; // XP al terminar el programa entero
  xpRewardDay: number; // XP por día completado
  estimatedKcal: number; // Total Kcal estimated for the whole program
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (user: UserState) => boolean;
}

export interface WorkoutLog {
  id: string;
  date: string;
  programTitle: string;
  dayTitle: string;
  totalVolume: number; // Peso * reps total
  totalSets?: number; // Total de series completadas (opcional para retrocompatibilidad)
  totalReps?: number; // Total de repeticiones completadas (opcional para retrocompatibilidad)
  durationMinutes: number;
  xpEarned: number;
  kcalBurned: number; // New: Calories burned in this session
}

// Estado de progreso del programa activo
export interface ActiveProgramProgress {
  programId: string;
  currentDayIndex: number; // Índice en el array schedule (0 a length-1)
  startedAt: string;
  // Guardamos el estado actual del día si el usuario sale de la pantalla
  currentDayLog?: {
    timer: number;
    exercises: ActiveExerciseState[];
  };
}

export interface UserState {
  name: string;
  avatar: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  completedWorkouts: number;
  totalWeightLifted: number;
  totalDurationMinutes: number;
  totalKcalBurned: number; // New: Total historical calories
  achievements: string[];
  history: WorkoutLog[];
  
  // Biometrics
  weight: number; // kg
  height: number; // cm
  age: number; // years

  // Nuevo: Programa activo
  activeProgram: ActiveProgramProgress | null;
  completedProgramIds: string[]; // IDs de programas terminados

  settings: {
    darkMode: boolean;
  };
}

export type ViewState = 'dashboard' | 'training' | 'active-workout' | 'stats' | 'profile' | 'achievements';