const colorList = require('../colors.json');
const fs = require('fs');
const path = require('path');

// gets SVG template
const svgTpl = fs.readFileSync(
  path.normalize(__dirname + '/template.svg.tpl'),
  'utf8'
).toString();

// generates an SVG image with the new color based on the diff ot the last commit to the current
function diffSVG() {
  const svgTxtStr = colorList.reduce((str, c, i) => {
    return `${str}<text x="40" y="${20 + (i + 1) * 70}" fill="${c.hex}">${c.name.replace(/&/g, '&amp;')}</text>`;
  }, '');

  fs.writeFileSync(
    path.normalize(`./colors.svg`),
    svgTpl.replace(/{height}/g, colorList.length * 70 + 80)
    .replace(/{items}/g, svgTxtStr)
  );
};

console.log(`Generating SVG image with ${colorList.length} colors`);

diffSVG();
