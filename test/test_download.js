import * as fs from "fs";

import { Selector } from 'testcafe';

import {me} from './roles';

fixture `download page`
  .page `www.tageblatt.de/index.php?pageid=177`;


function last_date() {
  var maxDate = new Date('1970-01-01');
  for (let v of fs.readdirSync(`${process.env.HOME}/Dropbox/tageblatt`)) {
    let date = new Date(v.split(' ')[0]);
    if (date > maxDate) {
      maxDate = date;
    }
  }
  return maxDate;
};

test( `download`, async t => {
  const lastDate = last_date();
  await t
    .useRole(me)
    .expect(Selector('#dateDropDown').visible).ok()
    .click('#dateDropDown');
  });
