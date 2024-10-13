// import mongoose from "mongoose";

// export const connection =()=>{
//     mongoose.connect(process.env.MONGO_URI,{
//         dbName: "JOB_PORTAL"
// }).then(()=>{
//     console.log("connected to db")
// }).catch(err=>{
//     console.log(`error occured ${err}`)
// })
// }

import mongoose from "mongoose";

export const connection =async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Server connection is connected");
    }catch(error){
        console.log("Server connection failed");
    }
}