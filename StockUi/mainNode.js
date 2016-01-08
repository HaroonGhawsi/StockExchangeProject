/**
 * Created by oracle on 12/2/15.
 */
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var bodyParser=require('body-parser');
var express = require('express');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var app = express();

app.use(cookieParser());

app.get('/fonts.css',function(request,response){
    response.sendfile('fonts.css',{root:__dirname+'/Style/'});
});

app.get('/index.css',function(request,response){
    response.sendfile('index.css',{root:__dirname+'/Style/'});
});

app.get('/login.css',function(request,response){
    response.sendfile('login.css',{root:__dirname+'/Style/'});
});

app.get('/StockAnalysis.jpg',function(request,response){
    response.sendfile('StockAnalysis.jpg',{root:__dirname+'/Images/'});
});

app.get('/profile.jpg',function(request,response){
    response.sendfile('profile.jpg',{root:__dirname+'/Images/'});
});

app.get('/videoChat.jpg',function(request,response){
    response.sendfile('videoChat.jpg',{root:__dirname+'/Images/'});
});

app.get('/Common.css',function(request,response){
    response.sendfile('Common.css',{root:__dirname+'/Style/'});
});

app.get('/global.css',function(request,response){
    response.sendfile('global.css',{root:__dirname+'/Style/'});
});

app.get('/style.css',function(request,response){
    response.sendfile('style.css',{root:__dirname+'/Style/'});
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.post('/login',function(req,res){

    var username = req.body.username;
    var pass = req.body.password;
    //console.log(request.body);
    var validity = 0;
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
                connection.execute(
                    "begin :rslt := app_user_security.valid_user(:u,:p); end;",
                    {
                        rslt:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxsize:500},
                        u:username,
                        p:pass,
                    },
                    function(err, result)
                    {
                        if (err) {
                            console.error(err.message);
                            doRelease(connection);
                        }

                        doRelease(connection);
                        res.header("Content-Type", "application/json; charset=utf-8");
                        res.write(result.outBinds.rslt);
                        res.end();
                        //console.log(result);
                    }); // end connection


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
});

//validate email as username
app.post('/chkEmailUnique',function(req,res){

    var username = req.body.username;
    //console.log(request.body);
    var validity = 0;
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
            connection.execute(
                "begin :rslt := app_user_security.unique_test_username(:u); end;",
                {
                    rslt:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER},
                    u:username,
                },
                function(err, result)
                {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                    }

                    doRelease(connection);
                    res.header("Content-Type", "application/json; charset=utf-8");
                    res.write('{"error":'+result.outBinds.rslt+'}');
                    res.end();
                    //console.log(result);
                }); // end connection


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
});

//registry
app.post('/reg',function(req,res){

    var username = req.body.username;
    var pass = req.body.password;
    var fname = req.body.fname;
    var lname = req.body.lname;
    //console.log(request.body);
    var validity = 0;
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
            connection.execute(
                "begin app_user_security.add_user(:u,:p,:f,:l); end;",
                {
                    u:username,
                    p:pass,
                    f:fname,
                    l:lname
                },
                function(err, result)
                {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                    }

                    doRelease(connection);
                    res.header("Content-Type", "application/json; charset=utf-8");
                    res.write('{"message":"Your data registered successfully!"}');
                    res.end();
                    //console.log(result);
                }); // end connection


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
});

//first show loign page
app.get('/',function(request,response){
    console.log("Cookies :  ", request.cookies);
    if (request.cookies.username){
        response.cookie('username' , request.cookies.username, {expire : new Date() + (0.00005787*24*60*60*1000)});
    }
    response.sendfile('index.html',{root:__dirname});
});

app.get('/signIn',function(request,response){
    response.sendfile('login.html',{root:__dirname});
});


//signUp page
app.get('/signUp',function(request,response){
    response.sendfile('signup.html',{root:__dirname});
});

//Rules page
app.get('/Rules',function(request,response){
    if (request.cookies.username){
        response.cookie('username' , request.cookies.username, {expire : new Date() + (0.00005787*24*60*60*1000)});
        response.sendfile('Rules.html',{root:__dirname});
    }
    else{
        response.sendfile('login.html',{root:__dirname});
    }

});

//profile
app.get('/profile',function(request,response){
    if (request.cookies.username){
        response.cookie('username' , request.cookies.username, {expire : new Date() + (0.00005787*24*60*60*1000)});
        response.cookie('alldata' , request.cookies.alldata, {expire : new Date() + (0.00005787*24*60*60*1000)});
        response.sendfile('profile.html',{root:__dirname});
    }
    else{
        response.sendfile('login.html',{root:__dirname});
    }

});

//signOut
app.get('/signOut',function(request,response){
    response.clearCookie('username');
    response.clearCookie('alldata');
    response.sendfile('index.html',{root:__dirname});
});

function getMainChartJson(symbol,response){
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
            var stmt = 'declare '+
                'l_cursor sys_refcursor; '+
                'begin '+
                    'APP_STK_API.set_symbol_prc(\''+symbol+'\');'+
                'open l_cursor for \'select data_ from hr.Stk_open_val_viw\'; '+
                ':res := APP_STK_API.get_chart_data_fun (l_cursor); '+
                'end;';
            connection.execute(
                stmt,
                {
                    res:{dir:oracledb.BIND_OUT,type:oracledb.STRING,maxSize:32767}
                },
                function(err, result)
                {
                    //console.log(result.outBinds.res);
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                    }

                    doRelease(connection);
                    var lob = result.outBinds.res;
                    console.log(lob);
                    response.writeHeader(200, {"Content-Type": "application/json"});
                    response.write(lob);
                    response.end();

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
        });
}

// write data for create chart
app.get('/AAPL',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('AAPL',response);

    //console.log(resObj.result);
   // response.write('[[0,0],[1,1]]');

});
app.get('/GOOG',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('GOOG',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/MSFT',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('MSFT',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/IBM',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('IBM',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/AMZN',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('AMZN',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/ORCL',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('ORCL',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/INTC',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('INTC',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/QCOM',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('QCOM',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/FB',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('FB',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/CSCO',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('CSCO',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/SAP',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('SAP',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/TSM',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('TSM',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/BIDU',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('BIDU',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/EMC',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('EMC',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/HPQ',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('HPQ',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/TXN',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('TXN',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/ERIC',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('ERIC',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/ASML',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('ASML',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/CAJ',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('CAJ',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});
app.get('/YHOO',function(request,response){


    //console.log('a'+getMainChartJson());
    getMainChartJson('YHOO',response);

    //console.log(resObj.result);
    // response.write('[[0,0],[1,1]]');

});

app.listen(8000,function(){console.log('Listening port 8000');});