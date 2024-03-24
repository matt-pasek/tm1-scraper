import cheerio from 'cheerio';
import iconv from 'iconv-lite';

import { AllSubstitutions, Substitution, TeacherSubstitution } from '../model/substitution';
import { cleanString } from './cleanup';

const fetchWithEncoding = async (url: string, encoding: string) => {
  const res = await fetch(url);
  return iconv.decode(Buffer.from(await res.arrayBuffer()), encoding);
};

export const scrapSubstitutions = async () => {
  const html = await fetchWithEncoding('https://zastepstwa.staff.edu.pl/', 'iso-8859-2');
  const $ = cheerio.load(html);
  const date = cleanString($('.st0').text().split(' ').slice(3).join(' '));

  const teacherSubstitutions: TeacherSubstitution[] = [];
  let absentTeacher = '';
  let substitutions: Substitution[] = [];
  $('tbody')
    .children()
    .each((_, el) => {
      let lessonNumber = '';
      let description = '';
      let newTeacher = '';
      let specialNote = '';
      if ($(el).find('.st1').length == 1) {
        if (absentTeacher) {
          teacherSubstitutions.push({ absentTeacher, substitutions });
          absentTeacher = '';
          substitutions = [];
        }
        absentTeacher = cleanString($(el).find('.st1').text());
      } else if (
        $(el).find('.st7').length ||
        $(el).find('.st10').length ||
        $(el).find('.st14').length
      ) {
        const children = $(el).children();
        lessonNumber = cleanString($(children[0]).text());
        description = cleanString($(children[1]).text());
        newTeacher = cleanString($(children[2]).text());
        specialNote = cleanString($(children[3]).text());
      }
      if (!lessonNumber) return;
      const [className, whatAndClassRoom] = description.split(' - ', 2);
      let what: string;
      let classroom = '';
      if (!whatAndClassRoom.includes(', ')) {
        what = whatAndClassRoom;
      } else {
        const splitWhatAndClassRoom = whatAndClassRoom.split(', ');
        classroom = splitWhatAndClassRoom.pop() as string;
        what = splitWhatAndClassRoom.join(', ');
      }

      substitutions.push({
        lessonNumber,
        className,
        what:
          what.includes('Uczniowie') || what.includes('konsekwencji') || what.includes('Czytelnia')
            ? 'Odwołane'
            : what,
        classroom,
        newTeacher: newTeacher,
        specialNote: specialNote,
      });
    });
  if (absentTeacher) {
    teacherSubstitutions.push({ absentTeacher, substitutions });
  }
  return {
    date,
    substitutions: teacherSubstitutions,
  } as AllSubstitutions;
};

export const scrapSchedules = async () => {
  await scrapSchedule('o1');
  return [];
};

const scrapSchedule = async (end: string) => {
  const html = await fetchWithEncoding(
    `https://zastepstwa.staff.edu.pl/plany/${end}.html`,
    'iso-8859-2',
  );
  const $ = cheerio.load(html);
  const tbody = $('tbody.tabela');
  console.log(tbody);
};
