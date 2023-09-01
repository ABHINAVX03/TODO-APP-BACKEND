const mongoose=require('mongoose')
require('dotenv').config()

const mongooseURI=process.env.DATABASE_LINK

const connectToMongo=async()=>{
    try {
        const conn=await mongoose.connect(mongooseURI,{useNewUrlParser: true,})
        console.log(`MongoDB Connected: {conn.connection.host}`);
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
module.exports=connectToMongo