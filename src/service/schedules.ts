import { Schedule } from '../model/schedule.model';
import { scrapSchedules } from '../helpers/scrap';

export const getSchedules = async (): Promise<Schedule[]> => {
  return await scrapSchedules();
};
