import * as fs from "fs";
const userPassFile = `${process.env.HOME}/secret/tageblatt-userpass.json`;

import {Role, Selector} from "testcafe";

export const me = Role(
  'https://tageblatt.de',
  async t => {
    const login_form = Selector('form').withAttribute(
      'action', RegExp('https://mein.tageblatt.de/login.html'));
    const anmeldeknopf = login_form.find('button[type="submit"]');
    const username = login_form.find('input[name="login"]');
    const password = login_form.find('input[name="pass"]');
    const userPass = JSON.parse(
      fs.readFileSync(userPassFile, 'utf-8'));
    await t
      .expect(login_form.exists).ok()
      .typeText(username,
                userPass.user, {replace: true})
      .typeText(password,
                userPass.password, {replace: true})
      .hover(anmeldeknopf)
      .click(anmeldeknopf, {speed: 0.7});
  }
);
