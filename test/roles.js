import * as fs from "fs";
const userPassFile = `${process.env.HOME}/secret/tageblatt-userpass.json`;

import {Role, Selector} from "testcafe";

export const me = Role(
  'https://mein.tageblatt.de/',
  async t => {
    const cookie_button = Selector('div.cc_banner-wrapper a');
    const anmeldeknopf = Selector('a').withText("Anmelden");
    const userPass = JSON.parse(
      fs.readFileSync(userPassFile, 'utf-8'));
    await t
    // .wait(2000)
    // .expect(cookie_button.visible).ok()
    // .click(cookie_button)
      .typeText('form#loginForm input[name="login"]',
                userPass.user, {replace: true})
      .typeText('form#loginForm input[name="pass"]',
                userPass.password, {replace: true})
      .hover(anmeldeknopf)
      .click(anmeldeknopf, {speed: 0.7});
  }
);
