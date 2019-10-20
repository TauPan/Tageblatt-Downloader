const target_dir = `${process.env.HOME}/Nextcloud/tageblatt`;
const download_dir = `${process.env.HOME}/Downloads`;
const wantedIssue = 'Buxtehuder Tageblatt';
const epaper_page = `https://www.tageblatt.de/index.php?pageid=177`;

import * as fs from "fs";

import { Selector } from 'testcafe';

import {me} from './roles';
const yearOption = Selector('option.yearOption', {timeout: 100});
const monthOption = Selector('option.monthOption', {timeout: 100});
const dayOption = Selector('span.dayspan', {timeout: 100});
const issueOption = Selector('option.editionOption', {timeout: 100})
      .withText(wantedIssue);
const downloadMode = Selector('button.downloadMode');
const finalDate = Date.now();

fixture `download page`
  .page(epaper_page)
  .beforeEach(t => t.resizeWindow(1920, 1080));;

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

async function show_date_dropdown(t) {
  const cal_container = Selector('div.calContainer');
  if (! (await cal_container.visible)) {
    await t
      .click('#dateDropDown')
      .expect(cal_container.visible).ok({timeout: 1000});
  }
};

async function change_selection(t, wanted_value, select, option) {
  await show_date_dropdown(t);
  let selected = await select.value;
  await t.hover(select);
  if (wanted_value !== selected) {
    await t
      .click(select)
      .hover(option)
      .click(option);
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
  await change_selection(t, wantedYear, Selector('select.yearSelect'),
                         currentYearOption);
  await change_selection(t, wantedMonth, Selector('select.monthSelect'),
                         currentMonthOption);
  await change_selection(t, wantedIssue,
                         Selector('select.editionSelect'), issueOption);
  await show_date_dropdown(t);
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
    await waitForFile(downloadFile);
    fs.renameSync(downloadFile, targetFile);
    await t.navigateTo(epaper_page);
  } else {
    // close date drop down, so we can open it again (unfortunately I
    // can't find a robust way to check if it's open)
    await t.pressKey('esc');
  }
};

// from https://testcafe-discuss.devexpress.com/t/interact-with-webapps-save-as-dialog/520/6
function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFile(filename) {
  for (;;) {
    try {
      fs.statSync(filename);
      return true;
    }
    catch (e) {
      if (e.code !== 'ENOENT')
        return true;

      await delay(300);
    }
  }
}

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
