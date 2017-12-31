import * as fs from "fs";
const userPassFile = `${process.env.HOME}/secret/tageblatt-userpass.json`;

import {Role, Selector} from "testcafe";

export const me = Role(
  'https://epaper.tageblatt.de/auth',
  async t => {
    const userPass = JSON.parse(
      fs.readFileSync(userPassFile, 'utf-8'));
    await t
      .typeText('div.Eingabetafel1 input[name="login"]',
                userPass.user, {replace: true})
      .typeText('div.Eingabetafel1 input[name="pass"]',
                userPass.password, {replace: true})
      .click(Selector('a').withText("Anmelden"));
  }
);
