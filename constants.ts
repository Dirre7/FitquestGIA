import { Achievement, Difficulty, Program, UserState, ExerciseTemplate, ProgramDay } from './types';

export const INITIAL_USER_STATE: UserState = {
  name: "Guerrero Fit",
  avatar: "https://placehold.co/200x200/14b8a6/FFF?text=GF",
  level: 1,
  currentXP: 0,
  nextLevelXP: 500,
  completedWorkouts: 0,
  totalWeightLifted: 0,
  achievements: [],
  history: [],
  activeProgram: null,
  completedProgramIds: [],
  settings: {
    darkMode: true,
  }
};

const getTotalMinutes = (user: UserState) => user.history.reduce((acc, curr) => acc + curr.durationMinutes, 0);

export const ACHIEVEMENTS: Achievement[] = [
   // --- CONSTANCIA (Workouts) ---
   { id: 'w1', name: "Primer Paso", description: "Completa tu primer entrenamiento.", icon: "🦶", unlocked: false, condition: (u) => u.completedWorkouts >= 1 },
   { id: 'w5', name: "Calentando Motores", description: "Completa 5 entrenamientos.", icon: "🛵", unlocked: false, condition: (u) => u.completedWorkouts >= 5 },
   { id: 'w10', name: "Hábito Formado", description: "Completa 10 entrenamientos.", icon: "🗓️", unlocked: false, condition: (u) => u.completedWorkouts >= 10 },
   { id: 'w25', name: "Guerrero Constante", description: "Completa 25 entrenamientos.", icon: "⚔️", unlocked: false, condition: (u) => u.completedWorkouts >= 25 },
   { id: 'w50', name: "Medio Centenar", description: "Completa 50 entrenamientos.", icon: "🎯", unlocked: false, condition: (u) => u.completedWorkouts >= 50 },
   { id: 'w75', name: "Dedicación Pura", description: "Completa 75 entrenamientos.", icon: "🧘", unlocked: false, condition: (u) => u.completedWorkouts >= 75 },
   { id: 'w100', name: "Centurión", description: "Completa 100 entrenamientos.", icon: "💯", unlocked: false, condition: (u) => u.completedWorkouts >= 100 },
   
   // --- NIVELES ---
   { id: 'lvl5', name: "Aprendiz", description: "Alcanza el nivel 5.", icon: "📜", unlocked: false, condition: (u) => u.level >= 5 },
   { id: 'lvl10', name: "Aventurero", description: "Alcanza el nivel 10.", icon: "🎒", unlocked: false, condition: (u) => u.level >= 10 },
   { id: 'lvl20', name: "Veterano", description: "Alcanza el nivel 20.", icon: "🎖️", unlocked: false, condition: (u) => u.level >= 20 },
   { id: 'lvl50', name: "Leyenda", description: "Alcanza el nivel 50.", icon: "👑", unlocked: false, condition: (u) => u.level >= 50 },
 
   // --- PROGRAMAS ---
   { id: 'prog1', name: "Graduado", description: "Completa tu primer programa.", icon: "🎓", unlocked: false, condition: (u) => u.completedProgramIds.length >= 1 },
   { id: 'prog3', name: "Maestro de Rutinas", description: "Completa 3 programas distintos.", icon: "📚", unlocked: false, condition: (u) => new Set(u.completedProgramIds).size >= 3 },
 
   // --- FUERZA ---
   { id: 'kg1k', name: "Hormiga Atómica", description: "Levanta 1,000kg en total.", icon: "🐜", unlocked: false, condition: (u) => u.totalWeightLifted >= 1000 },
   { id: 'kg10k', name: "Coche Compacto", description: "Levanta 10,000kg en total.", icon: "🚗", unlocked: false, condition: (u) => u.totalWeightLifted >= 10000 },
   { id: 'kg100k', name: "Ballena Azul", description: "Levanta 100,000kg en total.", icon: "🐋", unlocked: false, condition: (u) => u.totalWeightLifted >= 100000 },
];

const getImg = (name: string) => `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(name)}`;

// --- Helper Functions to build programs ---

const createExercise = (name: string, sets: number, reps: string, rest: number): ExerciseTemplate => ({
  id: name.toLowerCase().replace(/\s/g, '_') + Math.random().toString(36).substr(2, 5),
  name,
  image: getImg(name),
  targetSets: sets,
  targetReps: reps,
  restSeconds: rest
});

// --- PROGRAMA 1: DESPERTAR EN CASA (Principiante - Casa) ---
const homeDayA: ExerciseTemplate[] = [
  createExercise("Sentadillas al aire", 3, "12-15", 60),
  createExercise("Flexiones (o rodillas)", 3, "8-10", 60),
  createExercise("Zancadas Alternas", 3, "10/pierna", 60),
  createExercise("Plancha Abdominal", 3, "30 seg", 45),
];

const homeDayB: ExerciseTemplate[] = [
  createExercise("Puente de Glúteo", 3, "15", 60),
  createExercise("Fondos en silla", 3, "10-12", 60),
  createExercise("Remo con mochila/agua", 3, "12", 60),
  createExercise("Jumping Jacks", 3, "30", 45),
];

const homeDayC: ExerciseTemplate[] = [
  createExercise("Sentadilla Isométrica", 3, "30 seg", 60),
  createExercise("Flexiones Diamante (o cerradas)", 3, "8", 60),
  createExercise("Burpees (sin salto)", 3, "10", 90),
  createExercise("Superman", 3, "15", 45),
];

const buildHomeProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 4; w++) {
    schedule.push({ id: `h_w${w}_d1`, title: `Semana ${w} - Día 1: Full Body A`, exercises: homeDayA });
    schedule.push({ id: `h_w${w}_d2`, title: `Semana ${w} - Día 2: Full Body B`, exercises: homeDayB });
    schedule.push({ id: `h_w${w}_d3`, title: `Semana ${w} - Día 3: Desafío Metabólico`, exercises: homeDayC });
  }
  return schedule;
};

// --- PROGRAMA 2: GUERRERO DE HIERRO (Gimnasio - Intermedio) ---
const gymUpper: ExerciseTemplate[] = [
  createExercise("Press de Banca", 4, "8-10", 90),
  createExercise("Jalón al Pecho", 4, "10-12", 90),
  createExercise("Press Militar Mancuernas", 3, "10-12", 60),
  createExercise("Remo Gironda", 3, "12", 60),
  createExercise("Curl de Bíceps Barra", 3, "12-15", 45),
  createExercise("Extensión de Tríceps Polea", 3, "12-15", 45),
];

const gymLower: ExerciseTemplate[] = [
  createExercise("Sentadilla con Barra", 4, "8", 120),
  createExercise("Peso Muerto Rumano", 4, "10", 90),
  createExercise("Prensa de Piernas", 3, "12-15", 90),
  createExercise("Elevación de Gemelos", 4, "15-20", 45),
  createExercise("Plancha Abdominal", 3, "45 seg", 45),
];

const buildGymProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 6; w++) {
    schedule.push({ id: `g_w${w}_d1`, title: `Semana ${w} - Día 1: Torso Potencia`, exercises: gymUpper });
    schedule.push({ id: `g_w${w}_d2`, title: `Semana ${w} - Día 2: Pierna Potencia`, exercises: gymLower });
    schedule.push({ id: `g_w${w}_d3`, title: `Semana ${w} - Día 3: Torso Hipertrofia`, exercises: gymUpper.map(e => ({...e, targetReps: "12-15"})) });
    schedule.push({ id: `g_w${w}_d4`, title: `Semana ${w} - Día 4: Pierna Hipertrofia`, exercises: gymLower.map(e => ({...e, targetReps: "15-20"})) });
  }
  return schedule;
};

// --- PROGRAMA 3: ESTÉTICA DIVINA (Gimnasio - Avanzado) ---
const pushDay: ExerciseTemplate[] = [
  createExercise("Press Banca Inclinado", 4, "8", 90),
  createExercise("Press Militar", 4, "8", 90),
  createExercise("Aperturas Mancuernas", 3, "12", 60),
  createExercise("Elevaciones Laterales", 4, "15", 45),
  createExercise("Fondos Lastrados", 3, "10", 60),
];

const pullDay: ExerciseTemplate[] = [
  createExercise("Dominadas", 4, "Falllo", 90),
  createExercise("Remo con Barra", 4, "8-10", 90),
  createExercise("Face Pull", 3, "15", 60),
  createExercise("Curl Barra Z", 4, "10", 60),
  createExercise("Curl Martillo", 3, "12", 45),
];

const legDay: ExerciseTemplate[] = [
  createExercise("Sentadilla", 5, "5", 120),
  createExercise("Peso Muerto", 5, "5", 120),
  createExercise("Zancadas Búlgaras", 3, "10/p", 90),
  createExercise("Extensión Cuádriceps", 3, "15", 45),
  createExercise("Curl Femoral", 3, "15", 45),
];

const buildAdvProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 8; w++) {
    schedule.push({ id: `a_w${w}_d1`, title: `Semana ${w}: Empuje (Push)`, exercises: pushDay });
    schedule.push({ id: `a_w${w}_d2`, title: `Semana ${w}: Tracción (Pull)`, exercises: pullDay });
    schedule.push({ id: `a_w${w}_d3`, title: `Semana ${w}: Pierna (Legs)`, exercises: legDay });
    schedule.push({ id: `a_w${w}_d4`, title: `Semana ${w}: Upper Pump`, exercises: [...pushDay.slice(0,2), ...pullDay.slice(0,2)] });
    schedule.push({ id: `a_w${w}_d5`, title: `Semana ${w}: Lower Pump`, exercises: [...legDay.slice(2), createExercise("Gemelos Sentado", 4, "20", 45)] });
  }
  return schedule;
}

// --- PROGRAMA 4: INICIACIÓN AL HIERRO (Gimnasio - Principiante) ---
// 4 Semanas, 3 Días/semana
const gymBegDayA: ExerciseTemplate[] = [
  createExercise("Prensa de Piernas", 3, "12", 60),
  createExercise("Press de Pecho en Máquina", 3, "12", 60),
  createExercise("Jalón al Pecho", 3, "12", 60),
  createExercise("Crunch Abdominal", 3, "15", 45),
];

const gymBegDayB: ExerciseTemplate[] = [
  createExercise("Goblet Squat (Mancuerna)", 3, "10-12", 60),
  createExercise("Press Militar Sentado (Mancuernas)", 3, "10", 60),
  createExercise("Remo en Máquina", 3, "12", 60),
  createExercise("Plancha", 3, "30 seg", 45),
];

const gymBegDayC: ExerciseTemplate[] = [
  createExercise("Peso Muerto Rumano (Mancuernas)", 3, "10-12", 60),
  createExercise("Fondos en Máquina o Banco", 3, "10", 60),
  createExercise("Curl de Bíceps Máquina", 3, "12", 45),
  createExercise("Cardio Suave", 1, "15 min", 0),
];

const buildGymBegProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 4; w++) {
    schedule.push({ id: `gb_w${w}_d1`, title: `Semana ${w}: Máquinas A`, exercises: gymBegDayA });
    schedule.push({ id: `gb_w${w}_d2`, title: `Semana ${w}: Pesas Libres B`, exercises: gymBegDayB });
    schedule.push({ id: `gb_w${w}_d3`, title: `Semana ${w}: Mixto C`, exercises: gymBegDayC });
  }
  return schedule;
};

// --- PROGRAMA 5: CALISTENIA TÁCTICA (Casa - Intermedio) ---
// 6 Semanas, 4 Días/semana
const caliPush: ExerciseTemplate[] = [
  createExercise("Flexiones Explosivas", 4, "10", 90),
  createExercise("Fondos en Paralelas (o Sillas)", 4, "12", 90),
  createExercise("Flexiones declinadas", 3, "12", 60),
  createExercise("Pino contra pared (Hold)", 3, "30 seg", 60),
];

const caliLegs: ExerciseTemplate[] = [
  createExercise("Sentadilla Búlgara", 4, "10/p", 90),
  createExercise("Zancadas con Salto", 3, "20 total", 60),
  createExercise("Puente Glúteo a 1 pierna", 3, "12/p", 60),
  createExercise("Elevación Gemelo 1 pierna", 4, "15/p", 45),
];

const caliPull: ExerciseTemplate[] = [
  createExercise("Dominadas (o Remo invertido mesa)", 4, "8-10", 120),
  createExercise("Chin ups", 3, "8-10", 90),
  createExercise("Remo puerta con toalla", 4, "15", 60),
  createExercise("Superman Hold", 3, "45 seg", 45),
];

const caliCore: ExerciseTemplate[] = [
  createExercise("L-Sit (o progresión)", 3, "Al fallo", 90),
  createExercise("Leg Raises colgado (o suelo)", 4, "12", 60),
  createExercise("Mountain Climbers", 3, "45 seg", 45),
  createExercise("Burpees", 3, "15", 60),
];

const buildCaliProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 6; w++) {
    schedule.push({ id: `c_w${w}_d1`, title: `Semana ${w}: Empuje`, exercises: caliPush });
    schedule.push({ id: `c_w${w}_d2`, title: `Semana ${w}: Piernas Potencia`, exercises: caliLegs });
    schedule.push({ id: `c_w${w}_d3`, title: `Semana ${w}: Tracción`, exercises: caliPull });
    schedule.push({ id: `c_w${w}_d4`, title: `Semana ${w}: Core & HIIT`, exercises: caliCore });
  }
  return schedule;
};

// --- PROGRAMA 6: TITÁN DE FUERZA (Gimnasio - Avanzado) ---
// 8 Semanas, 4 Días/semana
const powerSquat: ExerciseTemplate[] = [
  createExercise("Sentadilla Low Bar", 5, "3-5", 180),
  createExercise("Sentadilla Frontal", 3, "6-8", 120),
  createExercise("Zancadas con Barra", 3, "10", 90),
  createExercise("Plancha con lastre", 3, "45 seg", 60),
];

const powerBench: ExerciseTemplate[] = [
  createExercise("Press Banca Competición", 5, "3-5", 180),
  createExercise("Press Banca Agarre Estrecho", 3, "6-8", 120),
  createExercise("Press Militar Estricto", 3, "6-8", 90),
  createExercise("Remo Pendlay", 4, "8", 90),
];

const powerDeadlift: ExerciseTemplate[] = [
  createExercise("Peso Muerto Convencional", 5, "2-4", 240),
  createExercise("Peso Muerto Déficit", 3, "6", 150),
  createExercise("Hip Thrust Pesado", 3, "8-10", 120),
  createExercise("Dominadas Lastradas", 3, "6-8", 120),
];

const powerAccessory: ExerciseTemplate[] = [
  createExercise("Press Inclinado Mancuernas", 3, "10", 90),
  createExercise("Curl Femoral Tumbado", 4, "12", 60),
  createExercise("Extensión Tríceps", 4, "15", 60),
  createExercise("Face Pull", 4, "15", 45),
];

const buildPowerProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 8; w++) {
    schedule.push({ id: `p_w${w}_d1`, title: `Semana ${w}: Sentadilla Pesada`, exercises: powerSquat });
    schedule.push({ id: `p_w${w}_d2`, title: `Semana ${w}: Banca Pesada`, exercises: powerBench });
    schedule.push({ id: `p_w${w}_d3`, title: `Semana ${w}: Peso Muerto Pesado`, exercises: powerDeadlift });
    schedule.push({ id: `p_w${w}_d4`, title: `Semana ${w}: Accesorios`, exercises: powerAccessory });
  }
  return schedule;
};

export const PROGRAMS: Program[] = [
  {
    id: 'prog_home_beg',
    title: "Despertar Casero",
    description: "Ideal para empezar. Sin equipo, solo tu peso corporal. Construye una base sólida desde la comodidad de tu hogar.",
    difficulty: Difficulty.BEGINNER,
    location: 'Casa',
    durationWeeks: 4,
    daysPerWeek: 3,
    xpRewardFinish: 1000,
    xpRewardDay: 150,
    schedule: buildHomeProgram()
  },
  {
    id: 'prog_gym_beg',
    title: "Iniciación al Hierro",
    description: "Tus primeros pasos en el gimnasio. Aprende a usar máquinas y pesas libres con seguridad y técnica.",
    difficulty: Difficulty.BEGINNER,
    location: 'Gimnasio',
    durationWeeks: 4,
    daysPerWeek: 3,
    xpRewardFinish: 1200,
    xpRewardDay: 160,
    schedule: buildGymBegProgram()
  },
  {
    id: 'prog_gym_int',
    title: "Guerrero de Hierro",
    description: "Programa clásico Upper/Lower para ganar fuerza y masa muscular. Requiere acceso a gimnasio completo.",
    difficulty: Difficulty.INTERMEDIATE,
    location: 'Gimnasio',
    durationWeeks: 6,
    daysPerWeek: 4,
    xpRewardFinish: 3000,
    xpRewardDay: 250,
    schedule: buildGymProgram()
  },
  {
    id: 'prog_cali_int',
    title: "Calistenia Táctica",
    description: "Domina tu peso corporal. Entrenamiento funcional de alta intensidad sin necesidad de pesas.",
    difficulty: Difficulty.INTERMEDIATE,
    location: 'Casa',
    durationWeeks: 6,
    daysPerWeek: 4,
    xpRewardFinish: 3200,
    xpRewardDay: 260,
    schedule: buildCaliProgram()
  },
  {
    id: 'prog_adv_hyb',
    title: "Estética Divina",
    description: "Frecuencia alta y volumen brutal. Solo para quienes llevan años entrenando. Split PPL+Upper+Lower.",
    difficulty: Difficulty.ADVANCED,
    location: 'Gimnasio',
    durationWeeks: 8,
    daysPerWeek: 5,
    xpRewardFinish: 5000,
    xpRewardDay: 350,
    schedule: buildAdvProgram()
  },
  {
    id: 'prog_power_adv',
    title: "Titán de Fuerza",
    description: "Enfocado puramente en incrementar tu 1RM en los tres grandes movimientos. Intensidad máxima.",
    difficulty: Difficulty.ADVANCED,
    location: 'Gimnasio',
    durationWeeks: 8,
    daysPerWeek: 4,
    xpRewardFinish: 5500,
    xpRewardDay: 380,
    schedule: buildPowerProgram()
  }
];