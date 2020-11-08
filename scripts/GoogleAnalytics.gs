// https://www.labnol.org/internet/track-google-spreadsheets/29107/

/**
* Track Spreadsheet views with Google Analytics
*
* @param {string} gaaccount Google Analytics Account like UA-1234-56.
* @param {string} spreadsheet Name of the Google Spreadsheet.
* @param {string} sheetname Name of individual Google Sheet.
* @return {string} imageURL The 1x1 tracking GIF image
* @customfunction
*/
function GOOGLEANALYTICS(gaaccount, spreadsheet, sheetname) {
  /**
  * Written by Amit Agarwal
  * Web: www.ctrlq.org
  * Email: amit@labnol.org
  */

  var imageURL = [
    'https://ssl.google-analytics.com/collect?v=1&t=event',
    '&tid=' + gaaccount,
    '&cid=' + Utilities.getUuid(),
    '&z=' + Math.round(Date.now() / 1000).toString(),
    '&ec=' + encodeURIComponent('Google Spreadsheets'),
    '&ea=' + encodeURIComponent(spreadsheet || 'Spreadsheet'),
    '&el=' + encodeURIComponent(sheetname || 'Sheet')
  ].join('');

  return imageURL;
}
