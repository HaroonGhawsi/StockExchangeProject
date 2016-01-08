var util = require('util');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
require('colors');

var _ = require('lodash');
var yahooFinance = require('yahoo-finance');

var SYMBOLS = [
  'AAPL',
  'GOOG',
  'MSFT',
  'IBM',
  'AMZN',
  'ORCL',
  'INTC',
  'QCOM',
  'FB',
  'CSCO',
  'SAP',
  'TSM',
  'BIDU',
  'EMC',
  'HPQ',
  'TXN',
  'ERIC',
  'ASML',
  'CAJ',
  'YHOO'
];

var dat1 = process.argv[3];
var dat2 = process.argv[4];

yahooFinance.historical({
  symbols: SYMBOLS,
  from: dat1,
  to: dat2,
  period: 'd'
}, function (err, result) {
  if (err) { throw err; }
  _.each(result, function (quotes, symbol) {
    console.log(util.format(
      '=== %s (%d) ===',
      symbol,
      quotes.length
    ).cyan);
    if (quotes[0]) {
      

oracledb.getConnection(
  {
    user          : dbConfig.user,
    password      : dbConfig.password,
    connectString : dbConfig.connectString
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);
      return;
    }
    for (var i = 0;i<quotes.length;i++){
    console.log(JSON.stringify(quotes[i], null, 2));
     connection.execute(
	"declare " +
	"v$sym varchar2(20 char) := :1; "+
	"v$data varchar2(32767 char) := :2; "+
         "begin " +
	"merge into stk_warehouse_datas swd "+
	"using dual " +
	"on (swd.val_stk_name_stkwd=v$sym and dbms_lob.compare(swd.jsn_saved_data_stkwd,v$data)=0) " +
	"when not matched then " +
	"insert (swd.warehouse_data_id,swd.val_stk_name_stkwd,swd.jsn_saved_data_stkwd) " +
	"values (stk_warehouse_data_seq.nextval,v$sym,v$data); commit; end;",
      [symbol,JSON.stringify(quotes[i], null, 2)],
      function(err, result)
      {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        //console.log(result);
      }); // end connection
    } // end loop
    doRelease(connection);
  });

function doRelease(connection)
{
  connection.release(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    });
}
      
    } //end if 
    
    else {
      console.log('N/A');
    }
  });
});
