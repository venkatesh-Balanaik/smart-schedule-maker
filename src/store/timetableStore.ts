import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Teacher {
  id: string;
  name: string;
  department: string;
  subjects: string[];
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
  periodsPerWeek: number;
  isLab: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  isLab: boolean;
}

export interface CollegeTiming {
  startTime: string;
  endTime: string;
  shortBreakDuration: number;
  longBreakDuration: number;
  periodsBeforeLongBreak: number;
}

export interface Rules {
  noTeacherContinuousPeriods: boolean;
  maxClassesPerTeacherPerDay: number;
  labsOncePerWeek: boolean;
  dailyMaxPeriodsPerClass: number;
  avoidHeavySubjectsAdjacent: boolean;
  balancedWorkload: boolean;
  restrictedPeriods: { [day: string]: number[] };
}

export interface TimetableSlot {
  subject: string;
  subjectId: string;
  teacher: string;
  teacherId: string;
  room: string;
  roomId: string;
  isBreak: boolean;
  isLongBreak: boolean;
  isLab: boolean;
  color: number;
}

export interface GeneratedTimetable {
  days: string[];
  periods: string[];
  grid: { [day: string]: TimetableSlot[] };
  conflicts: string[];
}

interface TimetableState {
  // Input data
  teachers: Teacher[];
  subjects: Subject[];
  classrooms: Classroom[];
  collegeTiming: CollegeTiming;
  workingDays: number;
  
  // Rules
  rules: Rules;
  
  // Generated timetable
  generatedTimetable: GeneratedTimetable | null;
  isGenerating: boolean;
  
  // Actions
  setTeachers: (teachers: Teacher[]) => void;
  addTeacher: (teacher: Teacher) => void;
  removeTeacher: (id: string) => void;
  
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  removeSubject: (id: string) => void;
  
  setClassrooms: (classrooms: Classroom[]) => void;
  addClassroom: (classroom: Classroom) => void;
  removeClassroom: (id: string) => void;
  
  setCollegeTiming: (timing: CollegeTiming) => void;
  setWorkingDays: (days: number) => void;
  setRules: (rules: Rules) => void;
  
  setGeneratedTimetable: (timetable: GeneratedTimetable | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  
  resetAll: () => void;
}

const initialCollegeTiming: CollegeTiming = {
  startTime: '09:00',
  endTime: '17:00',
  shortBreakDuration: 10,
  longBreakDuration: 45,
  periodsBeforeLongBreak: 4,
};

const initialRules: Rules = {
  noTeacherContinuousPeriods: true,
  maxClassesPerTeacherPerDay: 6,
  labsOncePerWeek: true,
  dailyMaxPeriodsPerClass: 8,
  avoidHeavySubjectsAdjacent: true,
  balancedWorkload: true,
  restrictedPeriods: {},
};

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set) => ({
      teachers: [],
      subjects: [],
      classrooms: [],
      collegeTiming: initialCollegeTiming,
      workingDays: 5,
      rules: initialRules,
      generatedTimetable: null,
      isGenerating: false,
      
      setTeachers: (teachers) => set({ teachers }),
      addTeacher: (teacher) => set((state) => ({ teachers: [...state.teachers, teacher] })),
      removeTeacher: (id) => set((state) => ({ teachers: state.teachers.filter((t) => t.id !== id) })),
      
      setSubjects: (subjects) => set({ subjects }),
      addSubject: (subject) => set((state) => ({ subjects: [...state.subjects, subject] })),
      removeSubject: (id) => set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) })),
      
      setClassrooms: (classrooms) => set({ classrooms }),
      addClassroom: (classroom) => set((state) => ({ classrooms: [...state.classrooms, classroom] })),
      removeClassroom: (id) => set((state) => ({ classrooms: state.classrooms.filter((c) => c.id !== id) })),
      
      setCollegeTiming: (collegeTiming) => set({ collegeTiming }),
      setWorkingDays: (workingDays) => set({ workingDays }),
      setRules: (rules) => set({ rules }),
      
      setGeneratedTimetable: (generatedTimetable) => set({ generatedTimetable }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      
      resetAll: () => set({
        teachers: [],
        subjects: [],
        classrooms: [],
        collegeTiming: initialCollegeTiming,
        workingDays: 5,
        rules: initialRules,
        generatedTimetable: null,
        isGenerating: false,
      }),
    }),
    {
      name: 'timetable-storage',
    }
  )
);
