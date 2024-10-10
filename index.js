var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var sql = require("mssql");
var app = express();
var fs = require("fs");
var server = require("http").Server(app);
port=5000;

// DataBase Connection Details

const config =  {
    user:  "sa",
    password: "1234",
    server: "BALAJI",
    database:"CoffeeClock" ,

options: {
enableArithAbort: true,
trustedConnection: true,
encrypt: true,
trustServerCertificate: true
}
}

// DataBase Connection through SSMS
var cp = new sql.ConnectionPool(config); //cp = connection pool
app.use(bodyParser.json());


//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
         "Access-Control-Allow-Methods",
         "GET,HEAD,OPTIONS,POST,PUT,DELETE"
    );
    res.header(
         "Access-Control-Allow-Headers",
         "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
    );
    next();
});

app.use(express.static(path.join(__dirname, "client", "buildfv")));
app.use(
    "/static",
    express.static(path.join(__dirname, "client/build/uploads"))
);

//Helps to get details of Customers who Contact Us

app.get("/ContactUsDetails", async (req, res, next) => {
    const result = await getpool();
    result.query("select * from CoffeeContact", function (err, data) {
         if (err) {
              console.log(err);
         } else {
              res.send(data.recordset);
         }
    });
});

//Helps to insert the data into DataBase

app.post("/insertContact",async(req,res,next)=>{
    const result = await getpool();
    result.query(`insert into CoffeeContact values('${req.body.Name}','${req.body.Email}','${req.body.Message}')`,
     (err,data)=>{
              if(err){
                   console.log(err);
                   }else{
                        res.send("inserted successfully");
                        }
                        });
                        })

                        app.post("/contact-us", async (req, res, next) => {
                         const result = await getpool();
                         const { Name, Email, Message } = req.body;
                         
                         result.query(
                             `INSERT INTO CoffeeContact (Name, Email, Message) VALUES ('${Name}', '${Email}', '${Message}')`,
                             (err, data) => {
                                 if (err) {
                                     console.log(err);
                                     res.status(500).send("Error inserting data");
                                 } else {
                                     res.status(200).send("Inserted successfully");
                                 }
                             }
                         );
                     });
                     

                        
app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

async function getpool() {
    const pool = await poolPromise;
    const result = await pool.request();
    return result;
}

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
         console.log("Connected to MSSQL");
         return pool;
    })
    .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

module.exports = {
    sql,
    poolPromise,
};

server.listen(port, function () {
    var port = server.address().port;
    console.log(`App now running on port,http://localhost:${port}/`);
});

//connect to database
cp.connect()
    .then(function () {
         console.log("Connection pool open for duty");
    })
    .catch(function (err) {
         console.log("Error connecting to Database.", err);
    });

//Function to connect to database and execute query
var executeQuery = function (res, query) {
    // console.log(query)
    const request = new sql.Request(cp);
    // query to the database
    request.query(query, function (err, recordset) {
         if (err) {
              console.log("Error while querying database :- " + err);
              res.send(err);
         } else {
              // console.log('Getting the list of the users..');
              res.send(recordset);
         }
    });
};

