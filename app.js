const express = require('express');
const path = require('path');

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json())

const rootDir = require('./util/path')
////////////////////////////////
// const mysql = require('mysql')
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'pass',
//   database: 'fakedata'
// })
// connection.connect(function(err) {
//     if (err){
      
//       console.log(err); 
//     } else{

//       console.log("Connected!");
//     }
//   });
  // connection.connect(function(err) {
  //   if (err) throw err;
   
  // });

  


const publicRoutes = require('./routes/public')
app.use(publicRoutes)

const newOrderRoute = require('./routes/new-order-data')
app.use(newOrderRoute)


app.use('/', (req, res, next) =>{
    console.log('up n runnin');
    res.status(404).sendFile(path.join(rootDir, 'views', '404.html'))
})


app.listen(4000)