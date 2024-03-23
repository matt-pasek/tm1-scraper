import { TeacherSubstitution } from '../model/substitution';
import { scrapSubstitutions } from '../helpers/scrap';

export const getSubstitutions = async (): Promise<TeacherSubstitution[]> => {
  return scrapSubstitutions();
};
