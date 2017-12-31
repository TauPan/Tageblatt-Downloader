const target_dir = `${process.env.HOME}/Dropbox/tageblatt`;
const download_dir = `${process.env.HOME}/Downloads`;
const wantedIssue = 'Buxtehuder Tageblatt';
const epaper_page = `https://www.tageblatt.de/index.php?pageid=177`;
import * as fs from "fs";

import { Selector } from 'testcafe';

import {me} from './roles';

fixture `download page`
  .page(epaper_page);


const monate = `Januar Februar März April Mai Juni Juli
August September Oktober November Dezember`.split(/\s/);

function last_date() {
  var maxDate = new Date('1970-01-01');
  for (let v of fs.readdirSync(target_dir)) {
    let date = new Date(v.split(' ')[0]);
    if (date > maxDate) {
      maxDate = date;
    }
  }
  return maxDate;
};


async function change_selection(t, wanted_value, select, option) {
  if (! await select.visible) {
    await t
      .click('#dateDropDown');
  }
  let selected = await select.value;
  if (wanted_value !== selected) {
    await t
      .click(select)
      .hover(option)
      .click(option);
  }
}

test( `download`, async t => {
  const lastFileDate = last_date();
  const finalDate = Date.now();
  const yearOption = Selector('option.yearOption');
  const monthOption = Selector('option.monthOption');
  const dayOption = Selector('span.dayspan');
  const issueOption = Selector('option.editionOption')
        .withText(wantedIssue);
  let date = lastFileDate;
  date.setDate(date.getDate() + 1);
  let wantedYear = date.getFullYear().toString();
  let currentYearOption = yearOption
      .withText(wantedYear);
  let wantedMonth = monate[date.getMonth()];
  let currentMonthOption = monthOption
      .withText(wantedMonth);
  let currentDayOption = dayOption
      .withText(date.getDate().toString());
  await t.useRole(me);
  await t.navigateTo(epaper_page);
  await t.expect(Selector('li#loginDropDown > a')
                 .withText("MEINE DATEN").exists).ok();
  await t
    .expect(Selector('#dateDropDown').visible).ok();
  change_selection(t, wantedYear, Selector('select.yearSelect'),
                   currentYearOption);
  change_selection(t, wantedMonth, Selector('select.monthSelect'),
                   currentMonthOption);
  change_selection(t, wantedIssue,
                   Selector('select.editionSelect'),
                   issueOption);
  await t
    .click('#dateDropDown')
    .hover(currentDayOption)
    .click(currentDayOption)
    .click('button.downloadMode')
    .hover('a#downloadComplete')
  ;
  let downloadFile = `${download_dir}/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 12_00_00_${wantedIssue}.pdf`;
  while (! fs.existsSync(targetFile)) {
    await t.sleep(1000);
  }
});
