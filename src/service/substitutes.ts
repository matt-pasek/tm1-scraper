import { AllSubstitutions } from '../model/substitution';
import { scrapSubstitutions } from '../helpers/scrap';

export const getSubstitutions = async (): Promise<AllSubstitutions> => {
  return await scrapSubstitutions();
};
