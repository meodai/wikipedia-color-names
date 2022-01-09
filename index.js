const fs = require('fs');
const puppeteer = require('puppeteer');

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
        const colorName = colorRow.querySelector('th a').innerText;
        const colorHex = colorRow.querySelector('td:nth-child(2)').innerText;
        colorList.push({
          name: colorName,
          hex: colorHex.toLowerCase()
        });
      }
      return colorList;
    });
    colors = colors.concat(colorList);
  }

  colors.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
  
  await browser.close();
  fs.writeFileSync('./colors.json', JSON.stringify(colors));
})();