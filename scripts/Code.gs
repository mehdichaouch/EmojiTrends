/** ** Documentation ****/
// https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet
// http://www.andrewroberts.net/google-apps-script/google-apps-script-development-best-practices/

/** ****************************************************************************
* Main funtion to run test
*/
function run() {
  try {
    emojiTrends.importInstagramTrends();
  } catch (e) {
    Logger.log('>>> ERROR: %s', e);
    // Browser.msgBox(e);
  }
}

var emojiTrends = (function(self) {
  'use strict';
  // https://developers.google.com/apps-script/guides/services/quotas#current_limitations
  var maxTimeExecution = 6 * 60 * 1000; // 360 seconds
  var rateLimit = 5000; // seconds

  var ss = '';

  var rawDataSheet = '';
  var settingsSheet = '';

  var instagramColumn = '';
  var instagramFirstRow = '';
  var instagramLastRow = '';
  var instagramLastRowDone = '';
  var instagramSearchUrl = '';

  var emojiColumn = '';
  var emojiFirstRow = '';

  var isProxy = '';
  var proxyUrl = '';

  var lastUpdate = '';

  var msgImportStart = '🔃 Import start';
  var msgImportComplete = '✅ Import is complete';
  var fetchOptions = {
    // "x-requested-with": "XMLHttpRequest",
    muteHttpExceptions: false
  };

  /** ***************************************************************************
  * Display import start message popup
  */
  self.importInstagramTrendsStartMessage = function() {
    Browser.msgBox('Emoji Trends', msgImportStart, Browser.Buttons.OK);
  };

  /** ***************************************************************************
  * Import
  */
  self.importInstagramTrends = function() {
    getConfig();
    ss.toast(msgImportStart);
    fetchInstagramTrends();
    ss.toast(msgImportComplete);
  };

  /** ***************************************************************************
  * Get configuration
  */
  function getConfig() {
    ss = SpreadsheetApp.getActiveSpreadsheet();

    var rawDataSheetName = ss.getRangeByName('InstagramSheet').getValue();
    rawDataSheet = ss.getSheetByName(rawDataSheetName);

    var settingsSheetName = ss.getRangeByName('SettingsSheet').getValue();
    settingsSheet = ss.getSheetByName(settingsSheetName);

    instagramColumn = ss.getRangeByName('InstagramColumn').getValue();
    instagramFirstRow = ss.getRangeByName('InstagramFirstRow').getValue();
    instagramLastRow = ss.getRangeByName('InstagramLastRow').getValue();
    instagramLastRowDone = ss.getRangeByName('InstagramLastRowDone').getValue();
    instagramSearchUrl = ss.getRangeByName('InstagramSearchUrl').getValue();

    emojiColumn = ss.getRangeByName('EmojiColumn').getValue();
    emojiFirstRow = ss.getRangeByName('EmojiFirstRow').getValue();

    isProxy = ss.getRangeByName('IsProxy').getValue();
    proxyUrl = ss.getRangeByName('ProxyUrl').getValue();

    lastUpdate = ss.getRangeByName('LastUpdate').getValue();
  }

  /** ***************************************************************************
  * Fetch Instagram Trends.
  * @return {void}
  */
  function fetchInstagramTrends() {
    try {
      // Check if daily import was done
      var currentDate = new Date();
      if (currentDate.getDate() === lastUpdate.getDate()
        && currentDate.getMonth() === lastUpdate.getMonth()
        && currentDate.getYear() === lastUpdate.getYear()) {
          Logger.log('Import was already done today');
          return 0;
        }

      // Check first emoji to start
      var firstRow = instagramFirstRow;
      if ('' !== instagramLastRowDone
          && instagramLastRowDone < instagramLastRow) {
        firstRow = (Number(instagramLastRowDone) + 1);
      }

      // Read emoji column
      var range = rawDataSheet.getRange(
        emojiColumn + firstRow + ':' + emojiColumn + instagramLastRow
      );
      var results = range.getDisplayValues();
      // Logger.log(results);

      // Logger.log(isProxy);
      for (var r in results) {
        // Logger.log(results[r]);

        if ('' === results[r]
            || 'Sample' === results[r]) {
          ss.getRangeByName('InstagramLastRowDone').setValue(Number(firstRow) + Number(r));
          continue;
        }

        // Generate url to call
        var url = instagramSearchUrl + results[r];
        if (isProxy) {
          url = proxyUrl + url;
        }
        // Logger.log(url);

        // Call fetch
        var json = getJson(url, fetchOptions);
        var number = '0';
        if (json.hashtags
            && json.hashtags[0]
            && json.hashtags[0].hashtag
            && json.hashtags[0].hashtag.media_count) {
          number = json.hashtags[0].hashtag.media_count;
        }
        // Logger.log(number);

        // Write stat in cell
        var cell = instagramColumn + (Number(firstRow) + Number(r));
        rawDataSheet.getRange(cell).setValue(number);

        // Update last done cell
        ss.getRangeByName('InstagramLastRowDone').setValue(Number(firstRow) + Number(r));

        Utilities.sleep(rateLimit);
      }

      if (instagramLastRow === instagramLastRowDone) {
        // Update last update cell
        ss.getRangeByName('LastUpdate').setValue(currentDate);
      }
    } catch (e) {
      Logger.log('>>> ERROR: %s', e);
      Browser.msgBox(e);
    }
  }

  return self;
})(emojiTrends || {});

/** *****************************************************************************
* Get Instagram hashtag post count.
*
* @param {string} url the URL
* @return {Object}
* @customfunction
**/
function INSTAHASHTAGPOSTCOUNT(url) {
  var requestOptions = {};
  requestOptions.headers = {
    // "x-requested-with": "XMLHttpRequest",
    muteHttpExceptions: false
  };

  var json = getJson(url, requestOptions);

  if (json.hashtags
      && json.hashtags[0]
      && json.hashtags[0].hashtag
      && json.hashtags[0].hashtag.media_count) {
    return json.hashtags[0].hashtag.media_count;
  }

  return 0;
}

/** *****************************************************************************
* @param {string} url The URL
* @param {Object} options Fetch options
* @return {Object}
*/
function getJson(url, options) {
  var response;
  var json;

  try {
    response = UrlFetchApp.fetch(url, options).getContentText();
    json = JSON.parse(response);
    // Logger.log(json);
    return json;
  } catch (e) {
    Logger.log('getJson() for %s : %s', url, e);
  }
}
