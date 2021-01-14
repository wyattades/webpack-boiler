/**
 * @jest-environment node
 */

const fs = require('fs');

const walk = (dir, orig = dir + '/', results = []) => {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) walk(file, orig, results);
    else results.push(file.replace(orig, ''));
  }
  return results;
};

describe('Build Tests', () => {
  it('has all the files', () => {
    const files = walk(__dirname + '/myBuildDirectory');

    expect(files).toEqual(
      expect.arrayContaining([
        'favicon.png',
        'index.html',
        'manifest.json',
        'sw.js',
        'inner/file.txt',
      ]),
    );

    expect(files.find((f) => f.match(/^foo\..+?\.js$/))).toBeTruthy();
    expect(files.find((f) => f.match(/^foo\..+?\.css$/))).toBeTruthy();
    expect(files.find((f) => f.match(/^bar\..+?\.js$/))).toBeTruthy();
    expect(files.find((f) => f.match(/^buzz\..+?\.js$/))).toBeTruthy();
    expect(files.find((f) => f.match(/^.+?\.worker\.js$/))).toBeTruthy();
  });
});
