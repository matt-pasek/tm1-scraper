import cheerio from 'cheerio';
import iconv from 'iconv-lite';

import { Substitution, TeacherSubstitution } from '../model/substitution';
import { cleanString } from './cleanup';

const fetchWithEncoding = async (url: string, encoding: string) => {
  const res = await fetch(url);
  return iconv.decode(Buffer.from(await res.arrayBuffer()), encoding);
};

export const scrapSubstitutions = async () => {
  const html = await fetchWithEncoding('https://zastepstwa.staff.edu.pl/', 'iso-8859-2');
  const $ = cheerio.load(html);
  const date = cleanString($('.st0').text().split(' ').slice(3).join(' '));
  console.log(date);

  // information about absent teachers and substitutions for their classes are all in one big tbody, so we need to iterate over each, but first, row
  // the data has a structure like this:
  // class st1 - absent teacher
  // row with useless classes: st4, st5, st6
  // multiple rows with classes:
  // st7 - lesson number;
  // st8 - class, what and classroom (in format [class] - [what], [classroom (if exists)]);
  // st8 - new teacher (if exists);
  // st9 - special note (if exists);
  // data that doesnt exist has &nbsp; as a value

  const teacherSubstitutions: TeacherSubstitution[] = [];
  let absentTeacher: string;
  let substitutions: Substitution[] = [];
  $('.st1').each((i, el) => {
    if (absentTeacher) {
      teacherSubstitutions.push({ date, absentTeacher, substitutions });
      substitutions = [];
    }
    absentTeacher = $(el).text().replace(/\n/g, '');
    $(el)
      .nextUntil('.st1')
      .each((i, el) => {
        if ($(el).hasClass('st7')) {
          const descriptionRow = $(el).next().text().split(' - ');
          const newTeacher = $(el).next().next().text();
          const specialNote = $(el).next().next().next().text();
          substitutions.push({
            lessonNumber: parseInt($(el).text().split(' ')[1]),
            class: descriptionRow[0],
            what: descriptionRow[1].split(', ')[0],
            classroom: descriptionRow[1].split(', ')[1],
            newTeacher: newTeacher === '\u00A0' ? undefined : newTeacher,
            specialNote: specialNote === '\u00A0' ? undefined : specialNote,
          });
        }
      });
  });
  return teacherSubstitutions;
};
