const waitForExpect = require('wait-for-expect');

const hasCustomElements = async (container, elements) => {
  for (const { tag, ...attr } of elements)
    await expect(page).toMatchElement(
      `${container || ''} ${tag}${Object.keys(attr)
        .map((key) => `[${key}="${attr[key]}"]`)
        .join('')}`,
    );
};

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

    await hasCustomElements(
      'head',
      Object.keys(meta).map((name) => ({
        tag: 'meta',
        name,
        content: meta[name],
      })),
    );
  });

  it('has custom headElements', async () => {
    await hasCustomElements('head', [
      {
        tag: 'script',
        src: 'not_found.js',
      },
    ]);
  });
});

describe('Page Content', () => {
  it('has custom bodyElements', async () => {
    await hasCustomElements('body', [
      {
        tag: 'div',
        id: 'hidden_el',
      },
    ]);
  });

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
