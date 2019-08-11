const waitForExpect = require('wait-for-expect');

let consoleOut = [];

beforeAll(async () => {
  consoleOut = [];

  page.on('console', (e) => consoleOut.push(e.text()));

  await page.goto('http://localhost:3033');
});

describe('Head content', () => {
  it('has meta tags', async () => {
    const meta = {
      'theme-color': '#3367D6',
      description: 'This is a great website',
    };

    for (const name in meta)
      await expect(page).toMatchElement(
        `head meta[name="${name}"][content="${meta[name]}"]`,
      );
  });
});

describe('Page Content', () => {
  // it('has javascript enabled', async () => {
  //   await expect(page).not.toMatch(
  //     'JavaScript must be enabled to run this page properly',
  //   );
  // });

  it('has dynamic text', async () => {
    await expect(page).toMatch('PAGE_URL=http://localhost:3033');
    await expect(page).toMatch('STATIC_PROP=foo');
    await expect(page).toMatch('THIS_PROP=bar');
    await expect(page).toMatch('DYNAMIC=Cats');
    await expect(page).toMatch(`NODE_ENV=${process.env.NODE_ENV}`);
  });

  it('has correct console output', async () => {
    await waitForExpect(() => {
      expect(consoleOut).toContain('Async works!');
    });

    expect(consoleOut).toEqual(
      expect.arrayContaining([
        "This doesn't do much...",
        'Worker file loaded.',
        'Parent received: {"foo":"foo"}',
        'Received message: "cow"',
      ]),
    );
  });
});
