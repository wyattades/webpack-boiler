const waitForExpect = require('wait-for-expect');

describe('Page Content', () => {
  const consoleOut = [];

  beforeAll(async () => {
    page.on('console', (e) => consoleOut.push(e.text()));

    await page.goto('http://localhost:3033');
  });

  it('has static text', async () => {
    await expect(page).toMatch('Test on page: http://localhost:3033');
  });

  it('has dynamic text', async () => {
    await expect(page).toMatch('foo');
    await expect(page).toMatch('bar');
    await expect(page).toMatch('Cats');
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
