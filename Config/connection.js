const mongoClient =require('mongodb').MongoClient
const state ={db : null}
module.exports.connect =  function(done)
{
  const url =process.env.MONGODB_URI|| "mongodb+srv://a:a@homebakescluster.nb7tu.mongodb.net/db_HomeBakes?retryWrites=true&w=majority"//"mongodb://localhost:27017"
  const dbname = "db_HomeBakes"
   mongoClient.connect(url,{useUnifiedTopology:true},(err,data)=>{
     if(err) return done(err)
     state.db =  data.db(dbname)
    done()
  })
  
}

module.exports.get= function()
{
  return state.db
}