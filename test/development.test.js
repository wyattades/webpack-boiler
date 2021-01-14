const fs = require('fs');
const waitForExpect = require('wait-for-expect');

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
  let original;
  const filePath = __dirname + '/src/App.jsx';
  const backupPath = __dirname + '/src/_App.jsx';

  beforeAll(async () => {
    if (fs.existsSync(backupPath)) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      fs.copyFileSync(backupPath, filePath);
    } else {
      fs.copyFileSync(filePath, backupPath);
    }

    original = fs.readFileSync(filePath, 'utf8');

    await page.goto('http://localhost:3033');
  });

  afterAll(() => {
    fs.unlinkSync(filePath);
    fs.renameSync(backupPath, filePath);
  });

  test.each(replacements)(
    'replaces "$oldText" with "$newText" at selector "$selector"',
    async ({ oldText, newText, selector }) => {
      await waitForExpect(() =>
        expect(page).toMatchElement(selector, { text: oldText }),
      );

      fs.writeFileSync(filePath, original.replace(oldText, newText), 'utf8');

      // I thought toMatchElement already retries for 30 seconds :/
      await waitForExpect(() =>
        expect(page).toMatchElement(selector, {
          text: newText,
        }),
      );
    },
    10000,
  );

  test('serves static files from `public` directory', async () => {
    await page.goto('http://localhost:3033/inner/file.txt');

    await expect(page).toMatch(/abcd/);
  });
});
