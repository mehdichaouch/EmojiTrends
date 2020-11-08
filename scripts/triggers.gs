/** ---------------------------------------------------------------------------
* Add menu
*/
function onOpen() {
  'use strict';
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('𝐌𝐞𝐧𝐮')
    .addItem('Update Emoji Trends', 'emojiTrends.importInstagramTrends')
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Triggers')
      .addItem('Create triggers', 'triggers.createTriggers')
      .addItem('Delete triggers', 'triggers.deleteTriggers'))
    .addToUi();
}

// -----------------------------------------------------------------------------
// Triggers create/delete
// -----------------------------------------------------------------------------
var triggers = (function(self) {
  'use strict';

  /** ***************************************************************************
  * Create triggers
  */
  self.createTriggers = function() {
    // Trigger every 10 minutes
    ScriptApp.newTrigger('emojiTrends.importInstagramTrends')
    .timeBased()
    .everyMinutes(10)
    .create();

    // Trigger for when a spreadsheet opens
//    var ss = SpreadsheetApp.getActiveSpreadsheet();
//    ScriptApp.newTrigger("emojiTrends.importInstagramTrendsStartMessage")
//    .forSpreadsheet(ss)
//    .onOpen()
//    .create();
//    var ss = SpreadsheetApp.getActiveSpreadsheet();
//    ScriptApp.newTrigger("emojiTrends.importInstagramTrends")
//    .forSpreadsheet(ss)
//    .onOpen()
//    .create();
  };

  /** ***************************************************************************
  * Delete triggers
  */
  self.deleteTriggers = function() {
    // Loop over all triggers and delete them
    var allTriggers = ScriptApp.getProjectTriggers();

    for (var i = 0; i < allTriggers.length; i++) {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  };

  return self;
})(triggers || {});
