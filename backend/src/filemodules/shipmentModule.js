const mongoose=require('mongoose')
const Location = require('./locationModule');
const schema=mongoose.Schema;

const shipmentSchema=new schema(
    {
        shipmentType:{
            type:String,
            require:true
        },
        orderNumber:{

        },
        orderType:{
            type:String,
            require:true
        },
        primaryMode:{
            type:String,
            require:true
        },
        expectedDeliveryDate:{
            type:Date,
            require:true
        },
        incoterm:{
            type:String,
            require:true
        },
        sourceLocation:{
            type:String,
            ref: 'Location',
            required: true,
        },
        destinationLocation:{
            type:String,
            ref: 'Location',
            required: true,
        },
        cargoType:{
            type:String,
            require:true
        },
        materialCode:{
            type:String,
            require:true
        },
        quantity:{
            type:Number,
            require:true
        },
        quantityUnit:{
            type:String,
            require:true
        },
        shipmentNumber:{
            type:String,
        },              
    },
    {
        versionKey: false,
    }
)
shipmentSchema.pre(/^find/, function (next) {
    this.populate('sourceLocation').populate('destinationLocation');
    next();
});
  
module.exports = mongoose.model("shipment",shipmentSchema)