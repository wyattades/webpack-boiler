const fs = require('fs');

describe('Changing source files hot-reloads', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3033');
  });

  it('Change text in App.js to show up on page live', async () => {
    const filePath = __dirname + '/src/App.js';
    const oldText = 'Here is some text!';
    const newText = 'Here is some new text!!!';

    await expect(page).toMatchElement('#hot_reload_test', oldText);

    const original = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, original.replace(oldText, newText), 'utf8');

    let err;
    try {
      await page.waitFor(2000);
      await expect(page).toMatchElement('#hot_reload_test', newText);
    } catch (e) {
      err = e;
    }
    fs.writeFileSync(filePath, original, 'utf8');
    if (err) throw err;
  });
});
