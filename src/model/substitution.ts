export interface TeacherSubstitution {
  date: string;
  absentTeacher: string;
  substitutions: Substitution[];
}

export interface Substitution {
  lessonNumber: number;
  class: string;
  what: string;
  classroom?: string;
  newTeacher?: string;
  specialNote?: string;
}
