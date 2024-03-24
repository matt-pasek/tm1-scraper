import cheerio from 'cheerio';
import iconv from 'iconv-lite';

import { AllSubstitutions, Substitution, TeacherSubstitution } from '../model/substitution';
import { cleanString } from './cleanup';
import { Lesson, Schedule } from '../model/schedule.model';

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
  const schedules = [];
  for (let i = 1; ; i++) {
    console.log(i);
    const schedule = await scrapSchedule('o' + i.toString());
    if (schedule.className === '') {
      return schedules;
    }
    schedules.push(schedule);
  }
};

const scrapSchedule = async (end: string) => {
  const concatenateTextWithSeparator = (elements: cheerio.Cheerio, separator: string) => {
    return elements
      .map(function (this: cheerio.Element) {
        return $(this).text();
      })
      .get()
      .join(separator);
  };
  const html = await fetchWithEncoding(
    `https://planlekcji.staff.edu.pl/plany/${end}.html`,
    'utf-8',
  );
  const $ = cheerio.load(html);
  const className = cleanString($('.tytulnapis').text());
  console.log(className);
  const days = {
    1: [] as Lesson[],
    2: [] as Lesson[],
    3: [] as Lesson[],
    4: [] as Lesson[],
    5: [] as Lesson[],
  };
  $('table.tabela')
    .find('tbody')
    .children()
    .each((_, el) => {
      if ($(el).find('.nr').length) {
        const children = $(el).children();
        const lessonNumber = cleanString($(children[0]).text());
        console.log('len: ' + children.length);
        console.log('less: ' + lessonNumber);
        for (let i = 2; i < children.length; i++) {
          const lesson = $(children[i]);
          if (!lesson.text().trim()) continue;
          const name = concatenateTextWithSeparator(lesson.find('.p'), '&');
          const teacher = concatenateTextWithSeparator(lesson.find('.n'), '&');
          const room = concatenateTextWithSeparator(lesson.find('.s'), '&');
          days[(i - 1) as 1 | 2 | 3 | 4 | 5].push({ name, teacher, room, lessonNumber });
        }
      }
    });
  const lessons = Object.entries(days).map(([weekDay, schedule]) => ({
    weekDay: parseInt(weekDay),
    schedule,
  }));
  return { className, lessons } as Schedule;
};
