import mongoose from "mongoose";
import { DB_Name } from '../constraints.js';

const connectDB=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(`\n Database connected successfully ${connectionInstance.connection.host}`)
        
    }catch(error)
    {
        console.log("Error in connection",error)
        process.exit(1)

    }
    
}
export default connectDB