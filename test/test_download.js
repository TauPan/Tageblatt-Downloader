const download_dir = `${process.env.HOME}/Dropbox/tageblatt`;

import * as fs from "fs";

import { Selector } from 'testcafe';

import {me} from './roles';

fixture `download page`
  .page `www.tageblatt.de/index.php?pageid=177`;


const monate = `Januar Februar März April Mai Juni Juli
August September Oktober November Dezember`.split(/\s/);

function last_date() {
  var maxDate = new Date('1970-01-01');
  for (let v of fs.readdirSync(download_dir)) {
    let date = new Date(v.split(' ')[0]);
    if (date > maxDate) {
      maxDate = date;
    }
  }
  return maxDate;
};

test( `download`, async t => {
  const lastFileDate = last_date();
  const finalDate = Date.now();
  const yearOption = Selector('option.yearOption');
  const monthOption = Selector('option.monthOption');
  const dayOption = Selector('span.dayspan');
  const issueOption = Selector('option.editionOption')
        .withText('Buxtehuder Tageblatt');
  let date = lastFileDate;
  date.setDate(date.getDate() + 1);
  let currentYearOption = yearOption
      .withText(date.getFullYear().toString());
  let currentMonthOption = monthOption
      .withText(monate[date.getMonth()]);
  let currentDayOption = dayOption
      .withText(date.getDate().toString());
  await t
    .useRole(me)
    .expect(Selector('#dateDropDown').visible).ok()
    .click('#dateDropDown')
    .click('select.yearSelect')
    .hover(currentYearOption)
    .click(currentYearOption)
    .click('#dateDropDown')
    .click('select.monthSelect')
    .hover(currentMonthOption)
    .click(currentMonthOption)
    .click('#dateDropDown')
    .click('select.editionSelect')
    .hover(issueOption)
    .click(issueOption)
    .click('#dateDropDown')
    .hover(currentDayOption)
    .click(currentDayOption)
    .click('button.downloadMode')
    .hover('a#downloadComplete')
    .debug()
      ;
});
