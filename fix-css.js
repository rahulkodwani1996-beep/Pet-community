import fs from 'fs';
let css = fs.readFileSync('./src/index.css', 'utf8');
css = css.replace(/!important/g, '');
css += `
* {
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease, fill 0.4s ease;
}
`;
fs.writeFileSync('./src/index.css', css);
