const express = require('express');
const app = express();
var cors = require('cors')
require('dotenv').config();
const shipmentRoutes = require('./routes/shipmentRoutes')
const mongoose=require('mongoose');
const helmet = require('helmet')
const bodyParser = require('body-parser')
const compression = require('compression');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(compression())

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log('hello')
    })
}).catch((error)=>{
    console.log(error);
})


app.use('/api/shipment',shipmentRoutes);