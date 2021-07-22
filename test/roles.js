import * as fs from "fs";
const userPassFile = `${process.env.HOME}/secret/tageblatt-userpass.json`;

import {Role, Selector} from "testcafe";

export const me = Role(
  'https://tageblatt.de',
  async t => {
    const username = Selector('#cpCustomFormUsername');
    const password = Selector('#cpCustomFormPassword');
    const userPass = JSON.parse(
      fs.readFileSync(userPassFile, 'utf-8'));
    await t
      .typeText(username,
                userPass.user, {replace: true})
      .typeText(password,
                userPass.password, {replace: true})
      .pressKey('tab')
      .pressKey('enter')
    ;
  }
);
