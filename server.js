const mongose = require('mongoose');
const app = require('./app'); 
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const db_username = process.env.DATABASE_LOCAL_USERNAME;
const db_password = process.env.DATABASE_LOCAL_PASSWORD;
const db_collection = process.env.DATABASE_LOCAL_COLLECTION;
const db_connection_string = process.env.DATABASE_LOCAL; 
const DB = db_connection_string
.replace('<USERNAME>', db_username)
.replace('<PASSWORD>', db_password)
.replace('<COLLECTION>', db_collection);

mongose
.connect(DB)
.then(()=>{console.log("DB successfully connected")})
.catch((err)=>{
  console.error('DB connection error:', err.message);
  process.exit(1); 
})

const port = process.env.PORT || 5000; 

app.listen(port, () => {
  console.log("Port Is Listening From http://localhost:" + port);
});
