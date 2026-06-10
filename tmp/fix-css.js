const fs = require('fs');
let css = fs.readFileSync('./src/index.css', 'utf8');
css = css.replace(/!important/g, '');
// Add transition to everything for smooth theme toggling
css += `
* {
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
}
`;
fs.writeFileSync('./src/index.css', css);
