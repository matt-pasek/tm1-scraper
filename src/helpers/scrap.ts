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
      let specialNote = '';
      if ($(el).find('.st1').length == 1) {
        if (absentTeacher) {
          teacherSubstitutions.push({ absentTeacher, substitutions });
          absentTeacher = '';
          substitutions = [];
        }
        absentTeacher = cleanString($(el).find('.st1').text());
      } else if ($(el).find('.st7').length) {
        lessonNumber = cleanString($(el).find('.st7').text());
        description = cleanString($(el).find('.st8').text());
        specialNote = cleanString($(el).find('.st9').text());
      } else if ($(el).find('.st10').length) {
        lessonNumber = cleanString($(el).find('.st10').text());
        description = cleanString($(el).find('.st11').text());
        specialNote = cleanString($(el).find('.st12').text());
      } else if ($(el).find('.st14').length) {
        lessonNumber = cleanString($(el).find('.st4').text());
        description = cleanString($(el).find('.st13').text());
        specialNote = cleanString($(el).find('.st14').text());
      }
      if (!lessonNumber) return;
      const [className, whatClassRoomAndTeacher] = description.split(' - ');
      const [what, classroomAndTeacher] = whatClassRoomAndTeacher.split(', ');
      const [classroom, newTeacher, newTeacherSurname] = classroomAndTeacher
        ? classroomAndTeacher.split(' ')
        : ['', ''];
      substitutions.push({
        lessonNumber,
        className,
        what,
        classroom,
        newTeacher: newTeacher ? newTeacher + ' ' + newTeacherSurname : '',
        specialNote,
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
