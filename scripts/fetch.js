const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {titleCase} = require('title-case');

const pages = [
  'https://en.wikipedia.org/wiki/List_of_colors:_A%E2%80%93F',
  'https://en.wikipedia.org/wiki/List_of_colors:_G%E2%80%93M',
  'https://en.wikipedia.org/wiki/List_of_colors:_N%E2%80%93Z',
];

let colors = [];

(async () => {
  const browser = await puppeteer.launch();
  
  for (let i = 0; i < pages.length; i++) {
    const page = await browser.newPage();
    await page.goto(pages[i]);
    const colorList = await page.evaluate(_ => {
      const colorList = [];
      const colorTable = document.querySelector('table.wikitable');
      const colorRows = colorTable.querySelectorAll('tr');
      for (let i = 1; i < colorRows.length; i++) {
        const colorRow = colorRows[i];
        let $wrap = colorRow.querySelector('th a');
        //sometimes people mess up the links
        $wrap = $wrap ? $wrap : colorRow.querySelector('td');  

        const name = $wrap.innerText;
        const link = $wrap.href;
        const hex = colorRow.querySelector('td:nth-child(2)').innerText;
        colorList.push({
          name, hex, link,
        });
      }
      return colorList;
    });
    colors = colors.concat(colorList);
  }

  // data sanitization
  colors.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }).forEach(c => {
    c.name = titleCase(c.name);
    // remove parentheses and its contents from name
    c.name = c.name.replace(/\(.*\)/, '').trim();
    c.hex = c.hex.toLowerCase();
  });

  // remove duplicate names from colors list
  colors = colors.filter((c, i) => {
    const name = c.name;
    const index = colors.findIndex(c => c.name === name);
    if (index === i) {
      return true;
    }
    return false;
  });

  

  await browser.close();

  // update color count in readme.md
  // gets SVG template
  let svgTpl = fs.readFileSync(
    './readme.md',
    'utf8'
  ).toString();

  svgTpl = svgTpl.replace(/\(\*{2}(\d+)\*{2}\)/gm, `(**${colors.length}**)`);

  fs.writeFileSync(
    './readme.md',
    svgTpl
  );

  // create a csv file with the colors
  const csv = 'name, hex, link\n' + colors.map(c => `${c.name},${c.hex},${c.link}`).join('\n');
  
  fs.writeFileSync('./colors.csv', csv);
  fs.writeFileSync('./colors.min.json', JSON.stringify(colors));
  fs.writeFileSync('./colors.json', JSON.stringify(colors, null, 2));
})();