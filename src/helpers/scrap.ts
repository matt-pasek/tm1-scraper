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

  // information about absent teachers and substitutions for their classes are all in one big tbody, so we need to iterate over each, but first, row
  // the data has a structure like this:
  //<tr>
  // <td nowrap="" class="st1" colspan="4" align="LEFT" bgcolor="#FFDFBF">
  //  absent teacher
  // </td>
  // </tr>
  // <tr>
  // td with useless classes: st4, st5, st6
  // </tr>
  //<tr>
  // <td nowrap="" class="st7" align="LEFT">
  // lesson number
  // </td>
  // <td nowrap="" class="st8" align="LEFT">
  // religia 5pta5ptb - Uczniowie przychodzą później
  // </td>
  // <td nowrap="" class="st8" align="LEFT">
  // &nbsp;
  // </td>
  // <td nowrap="" class="st9" align="LEFT">
  // &nbsp;
  // </td>
  // </tr>
  // there is multiple rows with classes, so we need to iterate over them
  // class st1 - absent teacher
  // row with useless classes: st4, st5, st6
  // multiple rows with classes:
  // st7 - lesson number;
  // st8 - class, what and classroom (in format [class] - [what], [classroom (if exists)]);
  // st8 - new teacher (if exists);
  // st9 - special note (if exists);
  // data that doesnt exist has &nbsp; as a value
  const teacherSubstitutions: TeacherSubstitution[] = [];
  let absentTeacher = '';
  let substitutions: Substitution[] = [];
  $('tbody')
    .children()
    .each((_, el) => {
      if ($(el).find('.st1').length == 1) {
        if (absentTeacher) {
          teacherSubstitutions.push({ absentTeacher, substitutions });
          absentTeacher = '';
          substitutions = [];
        }
        absentTeacher = cleanString($(el).find('.st1').text());
      } else if ($(el).find('.st7').length) {
        const lessonNumber = cleanString($(el).find('.st7').text());
        const description = cleanString($(el).find('.st8').text());
        const [className, whatClassRoomAndTeacher] = description.split(' - ');
        const [what, classroomAndTeacher] = whatClassRoomAndTeacher.split(', ');
        const [classroom, newTeacher, newTeacherSurname] = classroomAndTeacher
          ? classroomAndTeacher.split(' ')
          : ['', ''];
        const specialNote = cleanString($(el).find('.st9').text());
        substitutions.push({
          lessonNumber,
          className,
          what,
          classroom,
          newTeacher: newTeacher ? newTeacher + ' ' + newTeacherSurname : '',
          specialNote,
        });
      } else if ($(el).find('.st10').length) {
        const lessonNumber = cleanString($(el).find('.st10').text());
        const description = cleanString($(el).find('.st11').text());
        const [className, whatClassRoomAndTeacher] = description.split(' - ');
        const [what, classroomAndTeacher] = whatClassRoomAndTeacher.split(', ');
        const [classroom, newTeacher, newTeacherSurname] = classroomAndTeacher
          ? classroomAndTeacher.split(' ')
          : ['', ''];
        const specialNote = cleanString($(el).find('.st12').text());
        substitutions.push({
          lessonNumber,
          className,
          what,
          classroom,
          newTeacher: newTeacher ? newTeacher + ' ' + newTeacherSurname : '',
          specialNote,
        });
      } else if ($(el).find('.st14').length) {
        const lessonNumber = cleanString($(el).find('.st4').text());
        const description = cleanString($(el).find('.st13').text());
        const [className, whatClassRoomAndTeacher] = description.split(' - ');
        const [what, classroomAndTeacher] = whatClassRoomAndTeacher.split(', ');
        const [classroom, newTeacher, newTeacherSurname] = classroomAndTeacher
          ? classroomAndTeacher.split(' ')
          : ['', ''];
        const specialNote = cleanString($(el).find('.st14').text());
        substitutions.push({
          lessonNumber,
          className,
          what,
          classroom,
          newTeacher: newTeacher ? newTeacher + ' ' + newTeacherSurname : '',
          specialNote,
        });
      }
    });
  if (absentTeacher) {
    teacherSubstitutions.push({ absentTeacher, substitutions });
  }
  return {
    date,
    substitutions: teacherSubstitutions,
  } as AllSubstitutions;
};
