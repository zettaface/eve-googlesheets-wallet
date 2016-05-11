# eve-googlesheets-wallet

##Description
EVE Online wallet journal for Google Spreadsheets.

##Installation
Just use the script editor to add the functions into the code.gs file

##Usage

###getWalletJournal()
Creates a sheet named prefix+"\_WalletJournal"(if not exist) and then fetches all new transactions

```js
function triggerFunc() {
  // Comment this if you need refTypeId instead of refTypeNames
  transactionTypes = getTransactionTypes();

  //Corporation example
  getWalletJournal("prefix1", "corp", /*Key ID*/, /*Verification Code*/);
  //Character example
  getWalletJournal("prefix2", "char", /*Key ID*/, /*Verification Code*/, /*Character ID*/);
}
```

Install triggerFunc on trigger(ex. once per day) or launch manually

### Note
Make first run from script editor to get required permissions
