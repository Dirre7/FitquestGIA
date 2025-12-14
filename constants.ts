import { Achievement, Difficulty, Program, UserState, ExerciseTemplate, ProgramDay } from './types';

export const INITIAL_USER_STATE: UserState = {
  name: "Guerrero Fit",
  avatar: "https://placehold.co/200x200/14b8a6/FFF?text=GF",
  level: 1,
  currentXP: 0,
  nextLevelXP: 500,
  completedWorkouts: 0,
  totalWeightLifted: 0,
  totalDurationMinutes: 0,
  totalKcalBurned: 0,
  achievements: [],
  history: [],
  weight: 0,
  height: 0,
  age: 0,
  activeProgram: null,
  completedProgramIds: [],
  settings: {
    darkMode: true,
  }
};

// --- HELPERS FOR ACHIEVEMENTS ---
const getTotalReps = (u: UserState) => u.history.reduce((acc, log) => acc + (log.totalReps || 0), 0);
const getTotalSets = (u: UserState) => u.history.reduce((acc, log) => acc + (log.totalSets || 0), 0);
const getMaxSessionVolume = (u: UserState) => Math.max(0, ...u.history.map(h => h.totalVolume));
const getMaxSessionDuration = (u: UserState) => Math.max(0, ...u.history.map(h => h.durationMinutes));
const hasFinishedProgram = (u: UserState, id: string) => u.completedProgramIds.includes(id);
const checkTimeOfDay = (u: UserState, startHour: number, endHour: number) => 
  u.history.some(h => {
    const hours = new Date(h.date).getHours();
    return hours >= startHour && hours < endHour;
  });

export const ACHIEVEMENTS: Achievement[] = [
   // --- CONSTANCIA (Workouts Count) [10] ---
   { id: 'w1', name: "Primer Paso", description: "Completa tu primer entrenamiento.", icon: "🦶", unlocked: false, condition: (u) => u.completedWorkouts >= 1 },
   { id: 'w5', name: "Calentando Motores", description: "Completa 5 entrenamientos.", icon: "🛵", unlocked: false, condition: (u) => u.completedWorkouts >= 5 },
   { id: 'w10', name: "Hábito Formado", description: "Completa 10 entrenamientos.", icon: "🗓️", unlocked: false, condition: (u) => u.completedWorkouts >= 10 },
   { id: 'w25', name: "Guerrero Constante", description: "Completa 25 entrenamientos.", icon: "⚔️", unlocked: false, condition: (u) => u.completedWorkouts >= 25 },
   { id: 'w50', name: "Medio Centenar", description: "Completa 50 entrenamientos.", icon: "🎯", unlocked: false, condition: (u) => u.completedWorkouts >= 50 },
   { id: 'w75', name: "Dedicación Pura", description: "Completa 75 entrenamientos.", icon: "🧘", unlocked: false, condition: (u) => u.completedWorkouts >= 75 },
   { id: 'w100', name: "Centurión", description: "Completa 100 entrenamientos.", icon: "💯", unlocked: false, condition: (u) => u.completedWorkouts >= 100 },
   { id: 'w200', name: "Espartano", description: "Completa 200 entrenamientos.", icon: "🛡️", unlocked: false, condition: (u) => u.completedWorkouts >= 200 },
   { id: 'w365', name: "Año de Hierro", description: "Completa 365 entrenamientos.", icon: "🌍", unlocked: false, condition: (u) => u.completedWorkouts >= 365 },
   { id: 'w500', name: "Inmortal", description: "Completa 500 entrenamientos.", icon: "🗿", unlocked: false, condition: (u) => u.completedWorkouts >= 500 },
   
   // --- NIVEL RPG [8] ---
   { id: 'lvl5', name: "Aprendiz", description: "Alcanza el nivel 5.", icon: "📜", unlocked: false, condition: (u) => u.level >= 5 },
   { id: 'lvl10', name: "Aventurero", description: "Alcanza el nivel 10.", icon: "🎒", unlocked: false, condition: (u) => u.level >= 10 },
   { id: 'lvl20', name: "Veterano", description: "Alcanza el nivel 20.", icon: "🎖️", unlocked: false, condition: (u) => u.level >= 20 },
   { id: 'lvl30', name: "Capitán", description: "Alcanza el nivel 30.", icon: "⭐", unlocked: false, condition: (u) => u.level >= 30 },
   { id: 'lvl40', name: "Héroe", description: "Alcanza el nivel 40.", icon: "🦸", unlocked: false, condition: (u) => u.level >= 40 },
   { id: 'lvl50', name: "Leyenda", description: "Alcanza el nivel 50.", icon: "👑", unlocked: false, condition: (u) => u.level >= 50 },
   { id: 'lvl75', name: "Semidiós", description: "Alcanza el nivel 75.", icon: "⚡", unlocked: false, condition: (u) => u.level >= 75 },
   { id: 'lvl99', name: "Dios del Fitness", description: "Alcanza el nivel 99.", icon: "🪐", unlocked: false, condition: (u) => u.level >= 99 },

   // --- FUERZA TOTAL (Volume Accumulation) [7] ---
   { id: 'kg1k', name: "Hormiga Atómica", description: "Levanta 1,000kg en total.", icon: "🐜", unlocked: false, condition: (u) => u.totalWeightLifted >= 1000 },
   { id: 'kg10k', name: "Coche Compacto", description: "Levanta 10,000kg en total.", icon: "🚗", unlocked: false, condition: (u) => u.totalWeightLifted >= 10000 },
   { id: 'kg50k', name: "Camión", description: "Levanta 50,000kg en total.", icon: "🚛", unlocked: false, condition: (u) => u.totalWeightLifted >= 50000 },
   { id: 'kg100k', name: "Ballena Azul", description: "Levanta 100,000kg en total.", icon: "🐋", unlocked: false, condition: (u) => u.totalWeightLifted >= 100000 },
   { id: 'kg250k', name: "Avión Jumbo", description: "Levanta 250,000kg en total.", icon: "✈️", unlocked: false, condition: (u) => u.totalWeightLifted >= 250000 },
   { id: 'kg500k', name: "Transbordador", description: "Levanta 500,000kg en total.", icon: "🚀", unlocked: false, condition: (u) => u.totalWeightLifted >= 500000 },
   { id: 'kg1m', name: "Titán Atlas", description: "Levanta 1,000,000kg en total.", icon: "🌐", unlocked: false, condition: (u) => u.totalWeightLifted >= 1000000 },

   // --- TIEMPO INVERTIDO [6] ---
   { id: 'time60', name: "La Primera Hora", description: "Acumula 60 minutos de entrenamiento.", icon: "⏱️", unlocked: false, condition: (u) => u.totalDurationMinutes >= 60 },
   { id: 'time300', name: "Jornada Laboral", description: "Acumula 5 horas (300 min) entrenando.", icon: "💼", unlocked: false, condition: (u) => u.totalDurationMinutes >= 300 },
   { id: 'time1k', name: "Ciclo Solar", description: "Acumula 24 horas (1440 min) entrenando.", icon: "☀️", unlocked: false, condition: (u) => u.totalDurationMinutes >= 1440 },
   { id: 'time3k', name: "Fin de Semana", description: "Acumula 50 horas (3000 min) entrenando.", icon: "🏖️", unlocked: false, condition: (u) => u.totalDurationMinutes >= 3000 },
   { id: 'time6k', name: "Maestría 100h", description: "Acumula 100 horas entrenando.", icon: "⏳", unlocked: false, condition: (u) => u.totalDurationMinutes >= 6000 },
   { id: 'time10k', name: "Dedicación Total", description: "Acumula 160 horas (casi una semana entera).", icon: "🕰️", unlocked: false, condition: (u) => u.totalDurationMinutes >= 10000 },

   // --- PROGRAMAS Y MISIONES [6] ---
   { id: 'prog1', name: "Graduado", description: "Completa tu primer programa.", icon: "🎓", unlocked: false, condition: (u) => u.completedProgramIds.length >= 1 },
   { id: 'prog3', name: "Trotamundos", description: "Completa 3 programas distintos.", icon: "🗺️", unlocked: false, condition: (u) => new Set(u.completedProgramIds).size >= 3 },
   { id: 'prog_home', name: "Héroe Casero", description: "Completa el programa 'Despertar Casero'.", icon: "🏠", unlocked: false, condition: (u) => hasFinishedProgram(u, 'prog_home_beg') },
   { id: 'prog_gym', name: "Nacido del Hierro", description: "Completa 'Iniciación al Hierro' o 'Guerrero de Hierro'.", icon: "🏗️", unlocked: false, condition: (u) => hasFinishedProgram(u, 'prog_gym_beg') || hasFinishedProgram(u, 'prog_gym_int') },
   { id: 'prog_cali', name: "Ninja Urbano", description: "Completa 'Calistenia Táctica'.", icon: "🥷", unlocked: false, condition: (u) => hasFinishedProgram(u, 'prog_cali_int') },
   { id: 'prog_power', name: "Powerlifter", description: "Completa el programa 'Titán de Fuerza'.", icon: "🦍", unlocked: false, condition: (u) => hasFinishedProgram(u, 'prog_power_adv') },

   // --- DESAFIOS SEMANALES [4] ---
   { id: 'chal_hell', name: "Superviviente del Infierno", description: "Completa el Desafío: Semana del Infierno.", icon: "🔥", unlocked: false, condition: (u) => hasFinishedProgram(u, 'chal_hell_week') },
   { id: 'chal_300', name: "Espíritu 300", description: "Completa el Desafío: El 300.", icon: "🛡️", unlocked: false, condition: (u) => hasFinishedProgram(u, 'chal_300_rep') },
   { id: 'chal_legs', name: "Silla de Ruedas", description: "Completa el Desafío: Destructor de Piernas.", icon: "🦿", unlocked: false, condition: (u) => hasFinishedProgram(u, 'chal_leg_dest') },
   { id: 'chal_pushups_master', name: "Maestro de las Flexiones", description: "Completa el Desafío de Flexiones.", icon: "💪", unlocked: false, condition: (u) => hasFinishedProgram(u, 'chal_pushups') },

   // --- VOLUMEN DE TRABAJO (Sets/Reps) [6] ---
   { id: 'reps1k', name: "Mil Repeticiones", description: "Realiza 1,000 repeticiones totales.", icon: "🔢", unlocked: false, condition: (u) => getTotalReps(u) >= 1000 },
   { id: 'reps5k', name: "Máquina de Reps", description: "Realiza 5,000 repeticiones totales.", icon: "🤖", unlocked: false, condition: (u) => getTotalReps(u) >= 5000 },
   { id: 'reps10k', name: "Infinito", description: "Realiza 10,000 repeticiones totales.", icon: "♾️", unlocked: false, condition: (u) => getTotalReps(u) >= 10000 },
   { id: 'sets100', name: "Centenar de Series", description: "Completa 100 series totales.", icon: "🧱", unlocked: false, condition: (u) => getTotalSets(u) >= 100 },
   { id: 'sets500', name: "Constructor", description: "Completa 500 series totales.", icon: "🔨", unlocked: false, condition: (u) => getTotalSets(u) >= 500 },
   { id: 'sets1k', name: "Arquitecto Corporal", description: "Completa 1,000 series totales.", icon: "📐", unlocked: false, condition: (u) => getTotalSets(u) >= 1000 },

   // --- HITOS DE SESIÓN (Records Personales) [7] ---
   { id: 'sesh_heavy', name: "Día Pesado", description: "Levanta más de 5,000kg en una sola sesión.", icon: "🐘", unlocked: false, condition: (u) => getMaxSessionVolume(u) >= 5000 },
   { id: 'sesh_hulk', name: "Modo Bestia", description: "Levanta más de 10,000kg en una sola sesión.", icon: "💥", unlocked: false, condition: (u) => getMaxSessionVolume(u) >= 10000 },
   { id: 'sesh_godzilla', name: "Godzilla", description: "Levanta más de 20,000kg en una sola sesión.", icon: "🦖", unlocked: false, condition: (u) => getMaxSessionVolume(u) >= 20000 },
   { id: 'sesh_long', name: "Resistencia", description: "Entrena más de 60 minutos en una sesión.", icon: "🔋", unlocked: false, condition: (u) => getMaxSessionDuration(u) >= 60 },
   { id: 'sesh_marathon', name: "Maratón", description: "Entrena más de 90 minutos en una sesión.", icon: "🏃", unlocked: false, condition: (u) => getMaxSessionDuration(u) >= 90 },
   { id: 'early_bird', name: "Alondra", description: "Completa un entrenamiento entre las 5:00 y las 8:00 AM.", icon: "🌅", unlocked: false, condition: (u) => checkTimeOfDay(u, 5, 8) },
   { id: 'night_owl', name: "Búho Nocturno", description: "Completa un entrenamiento entre las 22:00 y las 4:00 AM.", icon: "🦉", unlocked: false, condition: (u) => checkTimeOfDay(u, 22, 28) || checkTimeOfDay(u, 0, 4) }, // 22-24h handled by simple logic usually but keeping simple check
];

// --- Helper Functions to build programs ---

const createExercise = (name: string, sets: number, reps: string, rest: number, description: string): ExerciseTemplate => ({
  id: name.toLowerCase().replace(/\s/g, '_') + Math.random().toString(36).substr(2, 5),
  name,
  // image property removed
  description,
  targetSets: sets,
  targetReps: reps,
  restSeconds: rest
});

// --- PROGRAMA 1: DESPERTAR EN CASA (Principiante - Casa) ---
const homeDayA: ExerciseTemplate[] = [
  createExercise("Sentadilla Libre", 3, "12-15", 60, "Pies a la anchura de los hombros. Baja la cadera hacia atrás y abajo manteniendo la espalda recta, como si te sentaras en una silla invisible. Baja hasta que los muslos estén paralelos al suelo."),
  createExercise("Flexiones (o rodillas)", 3, "8-10", 60, "Manos bajo los hombros. Mantén el cuerpo en línea recta desde la cabeza a los talones (o rodillas). Baja el pecho hasta casi tocar el suelo y empuja explosivamente."),
  createExercise("Zancadas Alternas", 3, "10/pierna", 60, "Da un paso largo hacia adelante. Baja la cadera hasta que ambas rodillas formen ángulos de 90 grados. Mantén el torso erguido. Alterna piernas."),
  createExercise("Plancha Abdominal", 3, "30 seg", 45, "Apóyate en antebrazos y puntas de los pies. Mantén el cuerpo totalmente recto y contrae fuerte el abdomen y glúteos. No dejes que la cadera caiga."),
];

const homeDayB: ExerciseTemplate[] = [
  createExercise("Puente de Glúteo", 3, "15", 60, "Tumbado boca arriba, rodillas flexionadas. Eleva la cadera contrayendo los glúteos hasta alinear rodillas, cadera y hombros. Aprieta arriba 1 segundo."),
  createExercise("Fondos en silla", 3, "10-12", 60, "Apoya las manos en el borde de una silla. Baja la cadera flexionando los codos hasta 90 grados. Mantén la espalda cerca de la silla."),
  createExercise("Remo con mochila/agua", 3, "12", 60, "Inclina el torso hacia adelante con espalda recta. Tira de la mochila hacia tu cadera, manteniendo los codos pegados al cuerpo. Siente la contracción en la espalda."),
  createExercise("Jumping Jacks", 3, "30", 45, "Salta abriendo piernas y brazos simultáneamente. Vuelve a la posición inicial coordinando el movimiento. Mantén un ritmo fluido."),
];

const homeDayC: ExerciseTemplate[] = [
  createExercise("Sentadilla Isométrica", 3, "30 seg", 60, "Apoya la espalda contra una pared y baja hasta posición de sentadilla. Aguanta la posición sin moverte, manteniendo la tensión en los cuádriceps."),
  createExercise("Flexiones Diamante (o cerradas)", 3, "8", 60, "Igual que una flexión normal, pero junta las manos formando un diamante con índices y pulgares. Enfoca el esfuerzo en los tríceps."),
  createExercise("Burpees (sin salto)", 3, "10", 90, "Baja a posición de flexión, realiza una flexión, recoge las piernas hacia el pecho y ponte de pie. Hazlo de forma fluida pero controlada."),
  createExercise("Superman", 3, "15", 45, "Tumbado boca abajo, eleva simultáneamente brazos y piernas del suelo contrayendo la espalda baja y glúteos. Aguanta 1 segundo arriba."),
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
  createExercise("Press de Banca", 4, "8-10", 90, "Tumbado en el banco, baja la barra controladamente hasta tocar la parte baja del pecho. Empuja fuerte hacia arriba sin despegar la espalda del banco."),
  createExercise("Jalón al Pecho", 4, "10-12", 90, "Sentado, agarra la barra más ancho que los hombros. Tira de ella hacia la parte superior del pecho inclinándote ligeramente atrás. Controla el retorno."),
  createExercise("Press Militar Mancuernas", 3, "10-12", 60, "Sentado con respaldo recto. Empuja las mancuernas desde los hombros hasta estirar los brazos arriba. No arquees la espalda baja en exceso."),
  createExercise("Remo Gironda", 3, "12", 60, "Sentado en polea baja, espalda recta. Tira del agarre hacia el abdomen bajo, llevando los codos hacia atrás y sacando pecho."),
  createExercise("Curl de Bíceps Barra", 3, "12-15", 45, "De pie, sujeta la barra. Flexiona los codos para subir la barra al pecho sin balancear el cuerpo. Baja lento."),
  createExercise("Extensión de Tríceps Polea", 3, "12-15", 45, "De pie frente a la polea alta. Con los codos pegados al cuerpo, extiende los brazos hacia abajo separando la cuerda al final."),
];

const gymLower: ExerciseTemplate[] = [
  createExercise("Sentadilla con Barra", 4, "8", 120, "Barra sobre trapecios. Pies anchura hombros. Baja profundo manteniendo talones pegados al suelo y pecho alto. Empuja el suelo para subir."),
  createExercise("Peso Muerto Rumano", 4, "10", 90, "Con las piernas semirrígidas, baja la barra pegada a las piernas echando la cadera muy atrás hasta notar estiramiento en isquios. Sube apretando glúteo."),
  createExercise("Prensa de Piernas", 3, "12-15", 90, "Pies en la plataforma. Baja el peso hasta que las rodillas estén cerca del pecho (sin levantar glúteo). Empuja sin bloquear rodillas."),
  createExercise("Elevación de Gemelos", 4, "15-20", 45, "De pie o en máquina, eleva los talones lo máximo posible y baja hasta sentir un buen estiramiento. Rango completo."),
  createExercise("Plancha Abdominal", 3, "45 seg", 45, "Posición de tabla sobre codos. Contrae abdomen fuerte como si fueras a recibir un golpe. Respira controlado."),
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
  createExercise("Press Banca Inclinado", 4, "8", 90, "Banco a 30-45 grados. Barra al pecho alto. Prioriza la parte superior del pectoral. Controla la bajada."),
  createExercise("Press Militar", 4, "8", 90, "De pie, barra desde clavículas hasta encima de la cabeza. Contrae glúteos y abdomen para estabilidad."),
  createExercise("Aperturas Mancuernas", 3, "12", 60, "Tumbado, abre los brazos como un abrazo amplio hasta sentir estiramiento en el pecho. Cierra arriba apretando."),
  createExercise("Elevaciones Laterales", 4, "15", 45, "Sube las mancuernas a los lados hasta altura de hombros. Codos ligeramente flexionados. No uses impulso."),
  createExercise("Fondos Lastrados", 3, "10", 60, "En paralelas, inclina el cuerpo adelante para enfatizar pecho. Baja hasta que el hombro pase el codo."),
];

const pullDay: ExerciseTemplate[] = [
  createExercise("Dominadas", 4, "Falllo", 90, "Cuélgate y sube hasta pasar la barbilla por encima de la barra. Retrae escápulas antes de tirar."),
  createExercise("Remo con Barra", 4, "8-10", 90, "Torso inclinado casi paralelo al suelo. Tira la barra al ombligo. Espalda neutra en todo momento."),
  createExercise("Face Pull", 3, "15", 60, "Polea alta a la cara. Tira de la cuerda separando las manos hacia atrás de la cabeza. Codos altos."),
  createExercise("Curl Barra Z", 4, "10", 60, "Agarre en la curva de la barra. Flexiona codos sin moverlos de su posición junto al torso."),
  createExercise("Curl Martillo", 3, "12", 45, "Mancuernas con agarre neutro (palmas enfrentadas). Sube y baja controlado."),
];

const legDay: ExerciseTemplate[] = [
  createExercise("Sentadilla", 5, "5", 120, "Movimiento rey. Profundidad al menos paralela. Mantén la tensión en el core (maniobra valsava)."),
  createExercise("Peso Muerto", 5, "5", 120, "Barra pegada a espinillas. Tira con todo el cuerpo, empujando el suelo. Espalda bloqueada."),
  createExercise("Zancadas Búlgaras", 3, "10/p", 90, "Pie trasero elevado en banco. Baja verticalmente. Ejercicio unilateral clave para equilibrio y masa."),
  createExercise("Extensión Cuádriceps", 3, "15", 45, "Sentado en máquina. Extiende rodillas hasta bloquear. Aguanta 1 seg arriba. Baja lento."),
  createExercise("Curl Femoral", 3, "15", 45, "Tumbado o sentado. Flexiona rodillas llevando talones al glúteo. No levantes la cadera del banco."),
];

const buildAdvProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 8; w++) {
    schedule.push({ id: `a_w${w}_d1`, title: `Semana ${w}: Empuje (Push)`, exercises: pushDay });
    schedule.push({ id: `a_w${w}_d2`, title: `Semana ${w}: Tracción (Pull)`, exercises: pullDay });
    schedule.push({ id: `a_w${w}_d3`, title: `Semana ${w}: Pierna (Legs)`, exercises: legDay });
    schedule.push({ id: `a_w${w}_d4`, title: `Semana ${w}: Upper Pump`, exercises: [...pushDay.slice(0,2), ...pullDay.slice(0,2)] });
    schedule.push({ id: `a_w${w}_d5`, title: `Semana ${w}: Lower Pump`, exercises: [...legDay.slice(2), createExercise("Gemelos Sentado", 4, "20", 45, "Sentado, peso sobre rodillas. Eleva talones rango completo.")] });
  }
  return schedule;
}

// --- PROGRAMA 4: INICIACIÓN AL HIERRO (Gimnasio - Principiante) ---
// 4 Semanas, 3 Días/semana
const gymBegDayA: ExerciseTemplate[] = [
  createExercise("Prensa de Piernas", 3, "12", 60, "Pies anchura hombros en plataforma. Empuja con toda la planta del pie. No bloquees rodillas al final."),
  createExercise("Press de Pecho en Máquina", 3, "12", 60, "Ajusta el asiento para que los agarres estén a altura media del pecho. Empuja adelante y vuelve lento."),
  createExercise("Jalón al Pecho", 3, "12", 60, "Tira de la barra hacia el pecho superior. Mantén la espalda firme, no te columpies."),
  createExercise("Crunch Abdominal", 3, "15", 45, "Tumbado, flexiona el tronco intentando llevar costillas a cadera. No tires del cuello."),
];

const gymBegDayB: ExerciseTemplate[] = [
  createExercise("Goblet Squat (Mancuerna)", 3, "10-12", 60, "Sujeta una mancuerna pegada al pecho. Haz sentadillas manteniendo el torso muy vertical. Codos por dentro de rodillas."),
  createExercise("Press Militar Sentado (Mancuernas)", 3, "10", 60, "Siéntate recto. Sube las mancuernas desde los hombros hasta casi tocarse arriba. Controla el retorno."),
  createExercise("Remo en Máquina", 3, "12", 60, "Apoya el pecho en el pad. Tira de los agarres hacia atrás apretando la espalda."),
  createExercise("Plancha", 3, "30 seg", 45, "Codos bajo hombros. Cuerpo recto como una tabla. Aguanta la posición."),
];

const gymBegDayC: ExerciseTemplate[] = [
  createExercise("Peso Muerto Rumano (Mancuernas)", 3, "10-12", 60, "Mancuernas al frente. Deslízalas por los muslos bajando la cadera atrás. Siente el estiramiento posterior."),
  createExercise("Fondos en Máquina o Banco", 3, "10", 60, "Empuja hacia abajo extendiendo los codos. Mantén los hombros lejos de las orejas."),
  createExercise("Curl de Bíceps Máquina", 3, "12", 45, "Apoya los brazos en el predicador. Flexiona los codos subiendo el peso."),
  createExercise("Cardio Suave", 1, "15 min", 0, "Cinta, elíptica o bici a ritmo conversacional para enfriar y quemar extra."),
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
  createExercise("Flexiones Explosivas", 4, "10", 90, "Baja normal, pero sube con tanta fuerza que tus manos se despeguen ligeramente del suelo."),
  createExercise("Fondos en Paralelas (o Sillas)", 4, "12", 90, "Entre dos sillas estables. Baja hasta 90 grados y sube. Cuerpo recto."),
  createExercise("Flexiones declinadas", 3, "12", 60, "Pies elevados en sofá o silla. Manos en suelo. Enfoca en hombros y pecho superior."),
  createExercise("Pino contra pared (Hold)", 3, "30 seg", 60, "Trepa con los pies por la pared hasta quedar vertical sobre las manos. Aguanta."),
];

const caliLegs: ExerciseTemplate[] = [
  createExercise("Sentadilla Búlgara", 4, "10/p", 90, "Un pie apoyado atrás en silla. Baja con la pierna delantera hasta que el muslo quede paralelo al suelo."),
  createExercise("Zancadas con Salto", 3, "20 total", 60, "Haz una zancada y salta para cambiar de pierna en el aire. Aterriza suave y baja de nuevo."),
  createExercise("Puente Glúteo a 1 pierna", 3, "12/p", 60, "Tumbado, una pierna al aire. Empuja con el talón de la otra para subir la cadera."),
  createExercise("Elevación Gemelo 1 pierna", 4, "15/p", 45, "Apóyate en pared para equilibrio. Sube y baja con un solo pie."),
];

const caliPull: ExerciseTemplate[] = [
  createExercise("Dominadas (o Remo invertido mesa)", 4, "8-10", 120, "Sube la barbilla sobre la barra. Si no tienes barra, túmbate bajo una mesa robusta y tracciona hacia ella."),
  createExercise("Chin ups", 3, "8-10", 90, "Dominadas con agarre supino (palmas hacia ti). Enfoca en bíceps."),
  createExercise("Remo puerta con toalla", 4, "15", 60, "Engancha toalla en pomo. Inclínate atrás y tracciona hacia la puerta."),
  createExercise("Superman Hold", 3, "45 seg", 45, "Mantén la posición de Superman (brazos y piernas arriba) estáticamente."),
];

const caliCore: ExerciseTemplate[] = [
  createExercise("L-Sit (o progresión)", 3, "Al fallo", 90, "Apoya manos en suelo/sillas. Eleva el cuerpo y estira las piernas al frente formando una L."),
  createExercise("Leg Raises colgado (o suelo)", 4, "12", 60, "Colgado de barra o tumbado. Sube las piernas rectas hasta formar 90 grados con el torso."),
  createExercise("Mountain Climbers", 3, "45 seg", 45, "Posición de plancha. Lleva rodillas al pecho alternativamente a ritmo rápido."),
  createExercise("Burpees", 3, "15", 60, "Flexión, salto de rana y salto vertical con palmada. Intenso."),
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
  createExercise("Sentadilla Low Bar", 5, "3-5", 180, "Barra baja en deltoides posterior. Torso más inclinado. Enfoca en mover grandes pesos."),
  createExercise("Sentadilla Frontal", 3, "6-8", 120, "Barra apoyada en deltoides anterior. Torso muy vertical. Enfoca en cuádriceps y core."),
  createExercise("Zancadas con Barra", 3, "10", 90, "Paso largo. Controla el equilibrio. Rodilla trasera toca suelo suavemente."),
  createExercise("Plancha con lastre", 3, "45 seg", 60, "Plancha normal con disco en la espalda. Estabilidad total."),
];

const powerBench: ExerciseTemplate[] = [
  createExercise("Press Banca Competición", 5, "3-5", 180, "Pies plantados, arco lumbar, retracción escapular. Pausa de 1 seg en el pecho antes de subir."),
  createExercise("Press Banca Agarre Estrecho", 3, "6-8", 120, "Manos ancho de hombros. Codos pegados. Enfoca en tríceps para mejorar el bloqueo."),
  createExercise("Press Militar Estricto", 3, "6-8", 90, "De pie, sin impulso de piernas. Fuerza de hombros."),
  createExercise("Remo Pendlay", 4, "8", 90, "Espalda paralela al suelo. La barra empieza en el suelo en cada repetición. Explosivo."),
];

const powerDeadlift: ExerciseTemplate[] = [
  createExercise("Peso Muerto Convencional", 5, "2-4", 240, "Agarre mixto o hook. Tensión antes de subir (slack). Empuja el suelo, no tires con la espalda."),
  createExercise("Peso Muerto Déficit", 3, "6", 150, "Subido a un disco o plataforma baja. Aumenta el recorrido para mejorar la salida."),
  createExercise("Hip Thrust Pesado", 3, "8-10", 120, "Barra en cadera, espalda en banco. Empuja con glúteos hasta bloquear arriba."),
  createExercise("Dominadas Lastradas", 3, "6-8", 120, "Dominadas con cinturón y peso. Fuerza de espalda vertical."),
];

const powerAccessory: ExerciseTemplate[] = [
  createExercise("Press Inclinado Mancuernas", 3, "10", 90, "Volumen para pecho superior y hombro."),
  createExercise("Curl Femoral Tumbado", 4, "12", 60, "Aislamiento necesario para isquios."),
  createExercise("Extensión Tríceps", 4, "15", 60, "Salud del codo y volumen de brazo."),
  createExercise("Face Pull", 4, "15", 45, "Salud del hombro y deltoides posterior."),
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

// --- PROGRAMA 7: RUTINA RÁPIDA (Casa - Principiante) ---
const quickDay: ExerciseTemplate[] = [
  createExercise("Sentadilla al Aire", 3, "15", 30, "Pies ancho de hombros. Baja controlando y sube explosivo. Espalda recta."),
  createExercise("Flexiones Estrictas (o rodillas)", 3, "10", 30, "Manos bajo hombros. Codos a 45 grados. Baja hasta casi tocar el suelo."),
  createExercise("Plancha Frontal", 3, "30 seg", 30, "Antebrazos en el suelo. Cuerpo en línea recta. Contrae glúteo y abdomen.")
];

const buildQuickProgram = (): ProgramDay[] => {
  const schedule: ProgramDay[] = [];
  for (let w = 1; w <= 2; w++) {
     // 3 days a week
     schedule.push({ id: `q_w${w}_d1`, title: `Semana ${w} - Sesión 1`, exercises: quickDay });
     schedule.push({ id: `q_w${w}_d2`, title: `Semana ${w} - Sesión 2`, exercises: quickDay });
     schedule.push({ id: `q_w${w}_d3`, title: `Semana ${w} - Sesión 3`, exercises: quickDay });
  }
  return schedule;
};

// --- DESAFIOS SEMANALES DEFINICIONES ---

// Desafío 1: Semana del Infierno (Metabólico/Cardio)
const hellDay1: ExerciseTemplate[] = [
    createExercise("Burpees", 5, "15", 45, "Al suelo y arriba. Hazlo lo más rápido posible."),
    createExercise("Mountain Climbers", 5, "30 seg", 30, "Rodillas al pecho a velocidad máxima."),
    createExercise("Jump Squats", 4, "20", 45, "Sentadilla explosiva despegando del suelo."),
    createExercise("Plancha Jack", 4, "20", 30, "En posición de plancha, abre y cierra piernas saltando."),
];
const hellDay2: ExerciseTemplate[] = [
    createExercise("Zancadas con Salto", 4, "20 total", 45, "Alterna piernas en el aire."),
    createExercise("Flexiones Explosivas", 4, "10", 60, "Empuja fuerte para despegar manos."),
    createExercise("High Knees", 5, "30 seg", 30, "Rodillas arriba en el sitio, corriendo."),
    createExercise("Sit-ups rápidos", 4, "20", 45, "Abdominales clásicos a ritmo alto."),
];
// Repetimos estructura para completar 5 días infernales
const buildHellWeek = (): ProgramDay[] => {
    return [
        { id: 'hw_d1', title: 'Día 1: Ignición', exercises: hellDay1 },
        { id: 'hw_d2', title: 'Día 2: Combustión', exercises: hellDay2 },
        { id: 'hw_d3', title: 'Día 3: Llamas', exercises: hellDay1 },
        { id: 'hw_d4', title: 'Día 4: Cenizas', exercises: hellDay2 },
        { id: 'hw_d5', title: 'Día 5: Fénix', exercises: [...hellDay1, ...hellDay2].slice(0, 6) }, // Mix brutal
    ];
};

// Desafío 2: El 300 (Volumen Calistenia)
const spartanDay: ExerciseTemplate[] = [
    createExercise("Dominadas", 1, "25 total", 120, "Acumula 25 dominadas en las series que necesites."),
    createExercise("Peso Muerto (Ligero/Medio)", 1, "50 total", 120, "Acumula 50 repeticiones con peso controlable."),
    createExercise("Flexiones", 1, "50 total", 90, "Acumula 50 flexiones."),
    createExercise("Saltos al Cajón (o escalón)", 1, "50 total", 90, "Acumula 50 saltos."),
    createExercise("Floor Wipers", 1, "50 total", 90, "Acostado, barra en manos, lleva pies a un lado y otro."),
    createExercise("Clean & Press (Kettlebell/Mancuerna)", 1, "50 total", 120, "25 por brazo. Carga y empuja."),
];
const build300Challenge = (): ProgramDay[] => {
    return [
        { id: '300_d1', title: 'Intento 1: Supervivencia', exercises: spartanDay },
        { id: '300_d2', title: 'Intento 2: Resistencia', exercises: spartanDay },
        { id: '300_d3', title: 'Intento 3: Gloria', exercises: spartanDay },
    ];
};

// Desafío 3: Destructor de Piernas (Volumen Alto)
const legDestruction: ExerciseTemplate[] = [
    createExercise("Sentadilla", 10, "10", 90, "El método alemán de volumen. 10 series de 10. Brutal."),
    createExercise("Zancadas Caminando", 4, "20 pasos", 60, "Camina con mancuernas hasta que arda."),
    createExercise("Curl Femoral", 5, "15", 45, "Bombeo máximo de isquios."),
    createExercise("Extensiones Cuádriceps", 5, "15", 45, "Bombeo máximo de cuádriceps."),
];
const buildLegChallenge = (): ProgramDay[] => {
    return [
        { id: 'ld_d1', title: 'Día 1: Choque', exercises: legDestruction },
        { id: 'ld_d2', title: 'Día 2: Pavor', exercises: legDestruction }, // Solo 2 días porque no podrás caminar
    ];
};

// Desafío 4: Desafío de Flexiones
const pushupDay1: ExerciseTemplate[] = [
    createExercise("Flexiones Clásicas", 5, "Al fallo", 60, "La básica. Pecho al suelo, codos a 45 grados."),
    createExercise("Flexiones Abiertas", 4, "12-15", 60, "Manos más anchas que los hombros. Énfasis en pecho."),
    createExercise("Flexiones Declinadas", 4, "10-12", 60, "Pies elevados sobre silla o sofá. Pecho superior."),
];
const pushupDay2: ExerciseTemplate[] = [
    createExercise("Flexiones Diamante", 5, "8-12", 60, "Manos juntas bajo el pecho. Tríceps a fuego."),
    createExercise("Fondos en suelo (Pike)", 4, "10", 60, "Cuerpo en V invertida. Hombros y tríceps."),
    createExercise("Flexiones Sphinx", 3, "8-10", 60, "Antebrazos en suelo, empuja hasta estirar brazos. Tríceps puro."),
];
const pushupDay3: ExerciseTemplate[] = [
    createExercise("Flexiones Explosivas", 5, "5-8", 90, "Sube rápido, despega las manos. Potencia."),
    createExercise("Flexiones Arqueras", 4, "6/lado", 90, "Un brazo se estira, el otro empuja. Unilateral."),
    createExercise("Flexiones Spiderman", 4, "10/lado", 60, "Lleva rodilla al codo al bajar. Core y pecho."),
];

const buildPushupChallenge = (): ProgramDay[] => {
    return [
        { id: 'pc_d1', title: 'Día 1: Volumen Pecho', exercises: pushupDay1 },
        { id: 'pc_d2', title: 'Día 2: Tríceps Acero', exercises: pushupDay2 },
        { id: 'pc_d3', title: 'Día 3: Descanso Activo', exercises: [createExercise("Plancha", 5, "1 min", 60, "Mantén la posición.")] },
        { id: 'pc_d4', title: 'Día 4: Potencia', exercises: pushupDay3 },
        { id: 'pc_d5', title: 'Día 5: El Test Final', exercises: [createExercise("Flexiones Clásicas", 1, "MÁXIMO", 120, "Una sola serie al fallo absoluto. Récord."), ...pushupDay1] },
    ];
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
    estimatedKcal: 3600, // ~300 per session * 12 sessions
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
    estimatedKcal: 4200, // ~350 per session * 12 sessions
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
    estimatedKcal: 9600, // ~400 per session * 24 sessions
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
    estimatedKcal: 9000, // ~375 per session * 24 sessions
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
    estimatedKcal: 18000, // ~450 per session * 40 sessions
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
    estimatedKcal: 16000, // ~500 per session * 32 sessions
    schedule: buildPowerProgram()
  },
  {
    id: 'prog_quick_beg',
    title: "Rutina Rápida",
    description: "Solo 15 minutos. 3 ejercicios clave para activar todo el cuerpo. Ideal si tienes poco tiempo.",
    difficulty: Difficulty.BEGINNER,
    location: 'Casa',
    durationWeeks: 2,
    daysPerWeek: 3,
    xpRewardFinish: 500,
    xpRewardDay: 100, // Requested 100 XP
    estimatedKcal: 900,
    schedule: buildQuickProgram()
  },
  // --- DESAFIOS SEMANALES ---
  {
      id: 'chal_hell_week',
      title: "Semana del Infierno",
      description: "5 días de acondicionamiento metabólico extremo. Quema grasa y pon a prueba tu voluntad. Alta intensidad.",
      difficulty: Difficulty.CHALLENGE,
      location: 'Casa',
      durationWeeks: 1,
      daysPerWeek: 5,
      xpRewardFinish: 2000, // Very high reward for short time due to intensity
      xpRewardDay: 300,
      estimatedKcal: 2500,
      schedule: buildHellWeek()
  },
  {
      id: 'chal_300_rep',
      title: "El 300",
      description: "Inspirado en los espartanos. 3 días de volumen bestial con ejercicios compuestos. ¿Puedes terminarlo?",
      difficulty: Difficulty.CHALLENGE,
      location: 'Gimnasio',
      durationWeeks: 1,
      daysPerWeek: 3,
      xpRewardFinish: 2500,
      xpRewardDay: 400,
      estimatedKcal: 2000,
      schedule: build300Challenge()
  },
  {
      id: 'chal_leg_dest',
      title: "Destructor de Piernas",
      description: "Solo 2 días, pero no podrás caminar al día siguiente. Volumen alemán de 10x10. Solo para masoquistas.",
      difficulty: Difficulty.CHALLENGE,
      location: 'Gimnasio',
      durationWeeks: 1,
      daysPerWeek: 2,
      xpRewardFinish: 3000,
      xpRewardDay: 500,
      estimatedKcal: 1500,
      schedule: buildLegChallenge()
  },
  {
      id: 'chal_pushups',
      title: "Desafío de Flexiones",
      description: "Domina tu peso corporal. Una semana intensiva para pecho y tríceps.",
      difficulty: Difficulty.CHALLENGE,
      location: 'Casa',
      durationWeeks: 1,
      daysPerWeek: 5,
      xpRewardFinish: 1500,
      xpRewardDay: 300,
      estimatedKcal: 2000,
      schedule: buildPushupChallenge()
  }
];