import { 
  Teacher, 
  Subject, 
  Classroom, 
  CollegeTiming, 
  Rules, 
  GeneratedTimetable, 
  TimetableSlot 
} from '@/store/timetableStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const POPULATION_SIZE = 50;
const MAX_GENERATIONS = 100;
const MUTATION_RATE = 0.1;

interface ScheduleEntry {
  subjectId: string;
  teacherId: string;
  roomId: string;
  day: number;
  period: number;
}

interface Individual {
  schedule: ScheduleEntry[];
  fitness: number;
}

function calculatePeriods(timing: CollegeTiming): string[] {
  const periods: string[] = [];
  const start = parseTime(timing.startTime);
  const end = parseTime(timing.endTime);
  const periodDuration = 50; // 50 minutes per period
  
  let currentTime = start;
  let periodCount = 0;
  
  while (currentTime + periodDuration <= end) {
    periodCount++;
    const periodStart = formatTime(currentTime);
    const periodEnd = formatTime(currentTime + periodDuration);
    periods.push(`${periodStart} - ${periodEnd}`);
    
    currentTime += periodDuration;
    
    // Add short break after each period
    if (periodCount % timing.periodsBeforeLongBreak === 0) {
      currentTime += timing.longBreakDuration;
    } else {
      currentTime += timing.shortBreakDuration;
    }
  }
  
  return periods;
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function createEmptySlot(): TimetableSlot {
  return {
    subject: '',
    subjectId: '',
    teacher: '',
    teacherId: '',
    room: '',
    roomId: '',
    isBreak: false,
    isLongBreak: false,
    isLab: false,
    color: 0,
  };
}

function generateInitialPopulation(
  subjects: Subject[],
  teachers: Teacher[],
  classrooms: Classroom[],
  workingDays: number,
  periodsPerDay: number,
  rules: Rules
): Individual[] {
  const population: Individual[] = [];
  
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const schedule = generateRandomSchedule(subjects, teachers, classrooms, workingDays, periodsPerDay, rules);
    population.push({ schedule, fitness: 0 });
  }
  
  return population;
}

function generateRandomSchedule(
  subjects: Subject[],
  teachers: Teacher[],
  classrooms: Classroom[],
  workingDays: number,
  periodsPerDay: number,
  rules: Rules
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  const subjectAssignments: Map<string, number> = new Map();
  
  // Initialize subject assignment counts
  subjects.forEach(s => subjectAssignments.set(s.id, 0));
  
  // Create all required assignments
  for (const subject of subjects) {
    const teacher = teachers.find(t => t.id === subject.teacherId);
    if (!teacher) continue;
    
    const room = classrooms.find(c => c.isLab === subject.isLab) || classrooms[0];
    if (!room) continue;
    
    let assignedPeriods = 0;
    const targetPeriods = subject.periodsPerWeek;
    
    // For labs, assign 2 consecutive periods
    if (subject.isLab) {
      const day = Math.floor(Math.random() * workingDays);
      const period = Math.floor(Math.random() * (periodsPerDay - 1));
      
      schedule.push({
        subjectId: subject.id,
        teacherId: teacher.id,
        roomId: room.id,
        day,
        period,
      });
      schedule.push({
        subjectId: subject.id,
        teacherId: teacher.id,
        roomId: room.id,
        day,
        period: period + 1,
      });
    } else {
      // Regular subjects - distribute across days
      while (assignedPeriods < targetPeriods) {
        const day = Math.floor(Math.random() * workingDays);
        const period = Math.floor(Math.random() * periodsPerDay);
        
        // Check if restricted
        const dayName = DAYS[day];
        if (rules.restrictedPeriods[dayName]?.includes(period)) {
          continue;
        }
        
        schedule.push({
          subjectId: subject.id,
          teacherId: teacher.id,
          roomId: room.id,
          day,
          period,
        });
        assignedPeriods++;
      }
    }
  }
  
  return schedule;
}

function calculateFitness(
  schedule: ScheduleEntry[],
  subjects: Subject[],
  teachers: Teacher[],
  classrooms: Classroom[],
  workingDays: number,
  periodsPerDay: number,
  rules: Rules
): { fitness: number; conflicts: string[] } {
  let fitness = 1000;
  const conflicts: string[] = [];
  
  // Check for teacher conflicts (same teacher, same time)
  const teacherTimeSlots: Map<string, Set<string>> = new Map();
  
  // Check for room conflicts (same room, same time)
  const roomTimeSlots: Map<string, Set<string>> = new Map();
  
  for (const entry of schedule) {
    const timeKey = `${entry.day}-${entry.period}`;
    
    // Teacher conflict check
    if (!teacherTimeSlots.has(entry.teacherId)) {
      teacherTimeSlots.set(entry.teacherId, new Set());
    }
    if (teacherTimeSlots.get(entry.teacherId)!.has(timeKey)) {
      fitness -= 100;
      const teacher = teachers.find(t => t.id === entry.teacherId);
      conflicts.push(`Teacher ${teacher?.name} has conflicting classes at ${DAYS[entry.day]} period ${entry.period + 1}`);
    }
    teacherTimeSlots.get(entry.teacherId)!.add(timeKey);
    
    // Room conflict check
    if (!roomTimeSlots.has(entry.roomId)) {
      roomTimeSlots.set(entry.roomId, new Set());
    }
    if (roomTimeSlots.get(entry.roomId)!.has(timeKey)) {
      fitness -= 100;
      const room = classrooms.find(r => r.id === entry.roomId);
      conflicts.push(`Room ${room?.name} is double-booked at ${DAYS[entry.day]} period ${entry.period + 1}`);
    }
    roomTimeSlots.get(entry.roomId)!.add(timeKey);
  }
  
  // Check teacher continuous periods
  if (rules.noTeacherContinuousPeriods) {
    const teacherDayPeriods: Map<string, Map<number, number[]>> = new Map();
    
    for (const entry of schedule) {
      const key = entry.teacherId;
      if (!teacherDayPeriods.has(key)) {
        teacherDayPeriods.set(key, new Map());
      }
      if (!teacherDayPeriods.get(key)!.has(entry.day)) {
        teacherDayPeriods.get(key)!.set(entry.day, []);
      }
      teacherDayPeriods.get(key)!.get(entry.day)!.push(entry.period);
    }
    
    for (const [teacherId, dayMap] of teacherDayPeriods) {
      for (const [day, periods] of dayMap) {
        periods.sort((a, b) => a - b);
        let consecutive = 1;
        for (let i = 1; i < periods.length; i++) {
          if (periods[i] === periods[i - 1] + 1) {
            consecutive++;
            if (consecutive > 2) {
              fitness -= 20;
            }
          } else {
            consecutive = 1;
          }
        }
      }
    }
  }
  
  // Check balanced workload
  if (rules.balancedWorkload) {
    const teacherDailyCount: Map<string, Map<number, number>> = new Map();
    
    for (const entry of schedule) {
      if (!teacherDailyCount.has(entry.teacherId)) {
        teacherDailyCount.set(entry.teacherId, new Map());
      }
      const dayCount = teacherDailyCount.get(entry.teacherId)!.get(entry.day) || 0;
      teacherDailyCount.get(entry.teacherId)!.set(entry.day, dayCount + 1);
    }
    
    for (const [teacherId, dayMap] of teacherDailyCount) {
      const counts = Array.from(dayMap.values());
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / counts.length;
      fitness -= variance * 5;
    }
  }
  
  return { fitness, conflicts };
}

function crossover(parent1: Individual, parent2: Individual): Individual {
  const crossoverPoint = Math.floor(Math.random() * parent1.schedule.length);
  const childSchedule = [
    ...parent1.schedule.slice(0, crossoverPoint),
    ...parent2.schedule.slice(crossoverPoint),
  ];
  
  return { schedule: childSchedule, fitness: 0 };
}

function mutate(
  individual: Individual,
  workingDays: number,
  periodsPerDay: number
): Individual {
  const mutatedSchedule = [...individual.schedule];
  
  for (let i = 0; i < mutatedSchedule.length; i++) {
    if (Math.random() < MUTATION_RATE) {
      mutatedSchedule[i] = {
        ...mutatedSchedule[i],
        day: Math.floor(Math.random() * workingDays),
        period: Math.floor(Math.random() * periodsPerDay),
      };
    }
  }
  
  return { schedule: mutatedSchedule, fitness: 0 };
}

function selectParent(population: Individual[]): Individual {
  // Tournament selection
  const tournamentSize = 5;
  let best: Individual | null = null;
  
  for (let i = 0; i < tournamentSize; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (!best || candidate.fitness > best.fitness) {
      best = candidate;
    }
  }
  
  return best!;
}

export function generateTimetable(
  teachers: Teacher[],
  subjects: Subject[],
  classrooms: Classroom[],
  timing: CollegeTiming,
  workingDays: number,
  rules: Rules
): GeneratedTimetable {
  const days = DAYS.slice(0, workingDays);
  const periods = calculatePeriods(timing);
  const periodsPerDay = periods.length;
  
  if (subjects.length === 0 || teachers.length === 0 || classrooms.length === 0) {
    return {
      days,
      periods,
      grid: {},
      conflicts: ['No data provided. Please add teachers, subjects, and classrooms.'],
    };
  }
  
  // Generate initial population
  let population = generateInitialPopulation(
    subjects,
    teachers,
    classrooms,
    workingDays,
    periodsPerDay,
    rules
  );
  
  // Evaluate initial fitness
  for (const individual of population) {
    const result = calculateFitness(
      individual.schedule,
      subjects,
      teachers,
      classrooms,
      workingDays,
      periodsPerDay,
      rules
    );
    individual.fitness = result.fitness;
  }
  
  // Evolve population
  for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
    const newPopulation: Individual[] = [];
    
    // Elitism - keep best individual
    population.sort((a, b) => b.fitness - a.fitness);
    newPopulation.push(population[0]);
    
    // Generate rest of population
    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = selectParent(population);
      const parent2 = selectParent(population);
      
      let child = crossover(parent1, parent2);
      child = mutate(child, workingDays, periodsPerDay);
      
      const result = calculateFitness(
        child.schedule,
        subjects,
        teachers,
        classrooms,
        workingDays,
        periodsPerDay,
        rules
      );
      child.fitness = result.fitness;
      
      newPopulation.push(child);
    }
    
    population = newPopulation;
    
    // Early termination if perfect solution found
    if (population[0].fitness >= 1000) {
      break;
    }
  }
  
  // Get best solution
  population.sort((a, b) => b.fitness - a.fitness);
  const bestSolution = population[0];
  
  const { conflicts } = calculateFitness(
    bestSolution.schedule,
    subjects,
    teachers,
    classrooms,
    workingDays,
    periodsPerDay,
    rules
  );
  
  // Convert schedule to grid format
  const grid: { [day: string]: TimetableSlot[] } = {};
  
  // Initialize grid with empty slots
  for (const day of days) {
    grid[day] = [];
    for (let i = 0; i < periodsPerDay; i++) {
      const isLongBreak = (i + 1) % timing.periodsBeforeLongBreak === 0 && i < periodsPerDay - 1;
      grid[day].push({
        ...createEmptySlot(),
        isLongBreak,
      });
    }
  }
  
  // Create subject color map
  const subjectColors: Map<string, number> = new Map();
  let colorIndex = 1;
  subjects.forEach(s => {
    if (!subjectColors.has(s.id)) {
      subjectColors.set(s.id, colorIndex++);
      if (colorIndex > 8) colorIndex = 1;
    }
  });
  
  // Fill in the schedule
  for (const entry of bestSolution.schedule) {
    const dayName = days[entry.day];
    if (!dayName || entry.period >= periodsPerDay) continue;
    
    const subject = subjects.find(s => s.id === entry.subjectId);
    const teacher = teachers.find(t => t.id === entry.teacherId);
    const room = classrooms.find(r => r.id === entry.roomId);
    
    if (subject && teacher && room) {
      grid[dayName][entry.period] = {
        subject: subject.name,
        subjectId: subject.id,
        teacher: teacher.name,
        teacherId: teacher.id,
        room: room.name,
        roomId: room.id,
        isBreak: false,
        isLongBreak: grid[dayName][entry.period].isLongBreak,
        isLab: subject.isLab,
        color: subjectColors.get(subject.id) || 1,
      };
    }
  }
  
  return {
    days,
    periods,
    grid,
    conflicts: conflicts.length > 0 ? conflicts : [],
  };
}
