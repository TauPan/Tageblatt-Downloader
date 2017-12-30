import { Selector } from 'testcafe';

import {me} from './roles';

fixture `download page`
  .page `www.tageblatt.de/index.php?pageid=177`;

test( `download`, async t => {
  await t
    .useRole(me)
    .expect(Selector('#dateDropDown').visible).ok();
});
