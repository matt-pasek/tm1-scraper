export interface AllSubstitutions {
  date: string;
  substitutions: TeacherSubstitution[];
}

export interface TeacherSubstitution {
  absentTeacher: string;
  substitutions: Substitution[];
}

export interface Substitution {
  lessonNumber: string;
  className: string;
  what: string;
  classroom?: string;
  newTeacher?: string;
  specialNote?: string;
}
