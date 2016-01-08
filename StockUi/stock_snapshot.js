var util = require('util');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

require('colors');

var _ = require('lodash');
var yahooFinance = require('yahoo-finance');

var FIELDS = _.flatten([
  // Pricing
  ['a', 'b', 'b2', 'b3', 'p', 'o'],
  // Dividends
  ['y', 'd', 'r1', 'q'],
  // Date
  ['c1', 'c', 'c6', 'k2', 'p2', 'd1', 'd2', 't1'],
  // Averages
  ['c8', 'c3', 'g', 'h', 'k1', 'l', 'l1', 't8', 'm5', 'm6', 'm7', 'm8', 'm3', 'm4'],
  // Misc
  ['w1', 'w4', 'p1', 'm', 'm2', 'g1', 'g3', 'g4', 'g5', 'g6'],
  // 52 Week Pricing
  ['k', 'j', 'j5', 'k4', 'j6', 'k5', 'w'],
  // System Info
  ['i', 'j1', 'j3', 'f6', 'n', 'n4', 's1', 'x', 'j2'],
  // Volume
  ['v', 'a5', 'b6', 'k3', 'a2'],
  // Ratio
  ['e', 'e7', 'e8', 'e9', 'b4', 'j4', 'p5', 'p6', 'r', 'r2', 'r5', 'r6', 'r7', 's7'],
  // Misc
  ['t7', 't6', 'i5', 'l2', 'l3', 'v1', 'v7', 's6', 'e1']
]);

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

yahooFinance.snapshot({
  fields: FIELDS,
  symbols: SYMBOLS
}).then(function (result) {
  _.each(result, function (snapshot, symbol) {
    console.log(util.format('=== %s ===', symbol).cyan);
    if (snapshot){
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

    console.log(JSON.stringify(snapshot, null, 2));
     connection.execute(
      "declare " +
          "v$sym varchar2(20 char) := :1; "+
          "v$data varchar2(32767 char) := :2; "+
         "begin " +
      "merge into stk_online_datas sod " + 
      "using dual " +
      "on (sod.VAL_STK_NAME_STOND=v$sym and dbms_lob.compare(sod.JSN_ONLINE_DATA_STOND,v$data)=0) " +
      "when not matched then " +
      "insert (sod.ONLINE_DATA_ID,sod.VAL_STK_NAME_STOND,sod.JSN_ONLINE_DATA_STOND) " +
      "values (STK_ONLINE_DATA_SEQ.nextval,v$sym,v$data); commit; end;",
      [SYMBOLS[symbol],JSON.stringify(snapshot, null, 2)],
      function(err, result)
      {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        //console.log(result);
      }); // end connection

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
    } // console.log(JSON.stringify(snapshot, null, 2));
  });
});
