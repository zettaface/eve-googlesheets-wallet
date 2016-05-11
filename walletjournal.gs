var transactionTypes = new Array();

function triggerFunc() {
  transactionTypes = getTransactionTypes();

  // Put getWalletJournal here
}

function getWalletJournal(prefix, keyType, keyID, vCode, characterID) {
  if (!prefix)
    throw "No prefix";

  var sheetName = prefix+"_WalletJournal";
  var css = SpreadsheetApp.getActiveSpreadsheet();
  var cs = css.getSheetByName(sheetName);
  var firstRow = 2;

  if (cs == null) {
    cs = createSheet(css, sheetName);
  }

  var lastID = cs.getRange(firstRow, 1, 1, 1).getValue();
  if (lastID == "") {
    lastID = 0;
  }

  var xml = getWalletJournalXML(keyType, keyID, vCode, characterID, 200);
  var data = new Array();
  var finished = false;
  var count = 0;

  do {
    var lastFetchedID;
    var rows = xml.getRootElement().getChild("result").getChild("rowset").getChildren();

    if (rows.length <= 0) {
      finished = true;
      break;
    }

    for(var i = 0; i < rows.length; i++) {
      var transaction = getTransaction(rows[i]);
      lastFetchedID = transaction[0];

      if (lastFetchedID == lastID && lastID > 0) {
        finished = true;
        break;
      }

      data.push(transaction);
    }

    xml = getWalletJournalXML(keyType, keyID, vCode, characterID, 200, lastFetchedID);
  } while (!finished);

  if (data.length == 0)
    return;

  cs.insertRowsBefore(firstRow, data.length);
  cs.getRange(firstRow, 1, data.length, data[0].length).setValues(data);
}

function createSheet(spreadsheet, sheetName) {
  var columnNames = [
    "refID",
    "Date",
    "Day",
    "Month",
    "Year",
    "Owner1",
    "Owner2",
    "Amount",
    "Type",
    "Balance"
  ];

  var newSheet = spreadsheet.insertSheet(sheetName);
  newSheet.getRange(1, 1, 1, columnNames.length).setValues([columnNames]);

  return newSheet;
}

function getWalletJournalXML(type, keyID, vCode, characterID, rowCount, fromID) {
  if (!type)
    throw "No type";

  if (!keyID)
    throw "No key ID";

  if (!vCode)
    throw "No Verification Code";

  var parameters = {method : "get", payload : ""};
  var url = "https://api.eveonline.com/"+type+"/WalletJournal.xml.aspx?keyID="+keyID+"&vCode="+vCode;

  if (type == "char") {
    if (characterID == null)
      throw "No character ID with key type \"char\"";

    url = url.concat("&characterID=", characterID);
  }

  if (fromID != null) {
    url += "&fromID="+fromID;
  }

  if (rowCount != null) {
    url += "&rowCount="+rowCount;
  }

  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  return XmlService.parse(xmlFeed);
}

function getTransactionTypes() {
  var parameters = {method : "get", payload : ""};
  var url = "https://api.eveonline.com/eve/RefTypes.xml.aspx";
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  var rows = xml.getRootElement().getChild("result").getChild("rowset").getChildren();

  var types = {};

  for(var i = 0; i < rows.length; i++) {
    var refTypeID = parseInt(rows[i].getAttribute("refTypeID").getValue());
    var refTypeName = rows[i].getAttribute("refTypeName").getValue();

    types[refTypeID] = refTypeName;
  }

  return types;
}

function getTransaction(row) {
  var typeID = parseInt(row.getAttribute("refTypeID").getValue());
  var transactionType = transactionTypes[typeID];
  if (transactionType == null)
    transactionType = typeID;

  var dateString = row.getAttribute("date").getValue();
  var m = dateString.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2}) \d{1,2}\:\d{1,2}\:\d{1,2}$/);

  return [
    row.getAttribute("refID").getValue(),
    dateString,
    m[3],
    m[2],
    m[1],
    row.getAttribute("ownerName1").getValue(),
    row.getAttribute("ownerName2").getValue(),
    parseFloat(row.getAttribute("amount").getValue()),
    transactionType,
    parseFloat(row.getAttribute("balance").getValue())
  ];
}
