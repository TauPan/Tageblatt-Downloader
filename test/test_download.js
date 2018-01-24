const target_dir = `${process.env.HOME}/Dropbox/tageblatt`;
const download_dir = `${process.env.HOME}/Downloads`;
const wantedIssue = 'Buxtehuder Tageblatt';
const epaper_page = `https://www.tageblatt.de/index.php?pageid=177`;

import * as fs from "fs";

import { Selector } from 'testcafe';

import {me} from './roles';
const yearOption = Selector('option.yearOption');
const monthOption = Selector('option.monthOption');
const dayOption = Selector('span.dayspan');
const issueOption = Selector('option.editionOption')
      .withText(wantedIssue);
const downloadMode = Selector('button.downloadMode');
const finalDate = Date.now();

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
  let selected = await select.value;
  await t.hover(select);
  if (wanted_value !== selected) {
    await t
      .click(select)
      .hover(option)
      .click(option)
      .click('#dateDropDown');
  }
  return t;
}

async function download_date_issue(t, date) {
  let wantedYear = date.getFullYear().toString();
  let currentYearOption = yearOption
      .withText(wantedYear);
  let wantedMonth = monate[date.getMonth()];
  let currentMonthOption = monthOption
      .withText(wantedMonth);
  let currentDayOption = dayOption
      .withText(date.getDate().toString());
  await t.click('#dateDropDown');
  await change_selection(t, wantedYear, Selector('select.yearSelect'),
                         currentYearOption);
  await change_selection(t, wantedMonth, Selector('select.monthSelect'),
                         currentMonthOption);
  await change_selection(t, wantedIssue,
                         Selector('select.editionSelect'), issueOption);
  await t
    .expect(currentDayOption.visible).ok();
  if (await currentDayOption.hasClass('issueMarker'))  {
    await t
      .click(currentDayOption, {speed: 0.7});
    await t
      .expect(downloadMode.visible).ok()
      .click(downloadMode)
      .click('a#downloadComplete');
    let downloadFilename = `${date.toLocaleString('de', {year:'numeric', month:'2-digit', day:'2-digit'})} 12_00_00_${wantedIssue}.pdf`;
    let downloadFile = `${download_dir}/${downloadFilename}`;
    let targetFile = `${target_dir}/${downloadFilename}`;
    await t
      .wait(10000)
      .expect(fs.existsSync(`${downloadFile}.crdownload`)
              || fs.existsSync(downloadFile)).ok();
    while (! fs.existsSync(downloadFile)) {
      await t.wait(1000);
    }
    fs.renameSync(downloadFile, targetFile);
    await t.navigateTo(epaper_page);
  } else {
    // close date drop down, so we can open it again (unfortunately I
    // can't find a robust way to check if it's open)
    await t.pressKey('esc');
  }
};

test( `download`, async t => {
  const lastFileDate = last_date();
  let date = lastFileDate;
  await t.useRole(me);
  while (! await Selector('li#loginDropDown > a')
         .withText("MEINE DATEN").exists) {
    await t.navigateTo(epaper_page);
  }
  await t
    .expect(Selector('#dateDropDown').visible).ok();
  while (date < finalDate) {
    date.setDate(date.getDate() + 1);
    await download_date_issue(t, date);
  }
});
