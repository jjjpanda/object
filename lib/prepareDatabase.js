var path       = require("path")
require('dotenv').config({
    path: path.join(process.cwd(), ".env")
})
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.database_USER,
    host: process.env.database_HOST,
    database: process.env.database_NAME,
    password: process.env.database_PASSWORD,
    port: process.env.database_PORT,
})

const query = pool.query("CREATE TABLE objects_detected(ID SERIAL PRIMARY KEY, timestamp TIMESTAMP DEFAULT NOW(), type VARCHAR(10), confidence NUMERIC(10, 6));")

module.exports = (callback) => {
    Promise.allSettled([query]).then(values => {
        let issues = false
        for(const value of values){
            const tableExists = value.status == "fulfilled" || (value.status == "rejected" && value.reason && value.reason.code == `42P07`)
            if(!tableExists) issues = true
        }

        if(issues){
            process.exit(1)
        } 
        else{
            callback()
        }
    })
}
