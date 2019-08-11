const fs = require('fs');

const replacements = [
  {
    oldText: 'Here is some text!',
    newText: 'Here is some new text!!!',
    selector: '#hot_reload_1',
  },
  {
    oldText: 'Code that changes',
    newText: 'Code that has changed',
    selector: '#hot_reload_2',
  },
];

describe('Changing source files hot-reloads', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3033');
  });

  it('Page has text that will be replaced', async () => {
    for (const { selector, oldText } in replacements)
      await expect(page).toMatchElement(selector, oldText);
  });

  it('Change text in App.js to show up on page live', async () => {
    const filePath = __dirname + '/src/App.js';

    const original = fs.readFileSync(filePath, 'utf8');

    let updated = original;
    for (const { oldText, newText } of replacements)
      updated = original.replace(oldText, newText);

    fs.writeFileSync(filePath, updated, 'utf8');

    let err;
    try {
      await page.waitFor(2000);

      for (const { selector, newText } in replacements)
        await expect(page).toMatchElement(selector, newText);
    } catch (e) {
      err = e;
    }
    fs.writeFileSync(filePath, original, 'utf8');
    if (err) throw err;
  });
});
