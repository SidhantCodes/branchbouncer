// src/cli/banner.js
const figlet = require('figlet');

function showBanner() {
  console.log(`
                   \\_________________/
                   |       | |       |
                   |       | |       |
                   |       | |       |
                   |_______| |_______|
                   |_______   _______|
                   |   B R A N C H   |
                   |  B O U N C E R  |
                    \\      | |      /
                     \\     | |     /
                      \\    | |    /
                       \\   | |   /
                        \\  | |  /
                         \\ | | /
                          \\| |/
                           \\_/
  `);
  console.log(figlet.textSync('BranchBouncer', {
    font: 'Doom',
    horizontalLayout: 'default'
  }));
}

module.exports = { showBanner };
