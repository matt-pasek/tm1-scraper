export interface Schedule {
  className: string;
  lessons: LessonDay[];
}

export interface LessonDay {
  weekDay: number;
  schedule: Lesson[];
}

export interface Lesson {
  name: string;
  teacher: string;
  room: string;
  lessonNumber: string;
}
