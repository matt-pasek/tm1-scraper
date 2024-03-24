export interface Schedule {
  className: string;
  lessons: Day[];
}

export interface Day {
  weekDay: string;
  schedule: Lesson[];
}

export interface Lesson {
  name: string;
  teacher: string;
  room: string;
  lessonNumber: string;
}
