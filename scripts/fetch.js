const fs = require('fs');
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
        const $link = colorRow.querySelector('th a');
        const name = $link.innerText;
        const link = $link.href;
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
  fs.writeFileSync('./colors.json', JSON.stringify(colors));
})();