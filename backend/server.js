const express= require('express');
// const nodemon=require('nodemon');
const mysql= require('mysql');
const cors=require('cors');
const app=express();
const session=require('express-session');
app.use(cors({
    origin:'http://localhost:5000',
    credentials:true
}));
app.use(express.json());

const db=mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'',
    database:'school2'
});
db.connect((err)=>{
    if(err){
        console.error(err);
    }//else{
       // console.log('connected to');
    //}
})

//session


app.use(session({
    secret:'123',
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:30000,httpOnly:true,secure:false}
}));


//login
app.post('/login',(req,res)=>{
    const {username,password}=req.body;
    db.query('select* from users where username=?',[username],(err,result)=>{
        if(err){
            console.error(err);
        }
        else{
        if(result.length===0){
            return res.json({message:'user not found!'});
        }
        else{
            const user=result[0];
            if(user.password===password){
                req.session.user={username:user.username}
                return res.json({message:'user logged in',username:req.session.user});
            }
            else{
            return res.json({message:'invalid password'});
        }
        }
        }
    });
});

//get courses
// Improved get-courses endpoint
app.get('/get-courses', (req, res) => {
    // Validate database connection first
    if (db.state === 'disconnected') {
      return res.status(500).json({ 
        success: false,
        message: 'Database connection is not active',
        error: 'DB_CONNECTION_ERROR'
      });
    }
  
    db.query('SELECT * FROM courses', (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch courses due to database error',
          error: err.code || 'DB_QUERY_ERROR'
        });
      }
  
      // Validate the results
      if (!Array.isArray(results)) {
        return res.status(500).json({
          success: false,
          message: 'Invalid data format received from database',
          error: 'INVALID_DATA_FORMAT'
        });
      }
  
      // Successful response
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    });
  });

//get students
app.get('/students',(req,res)=>{
  db.query('select * from students',(err,results)=>{
      if(err){
          return res.status(500).json({message:'Error while fetching student'});
      }
      return res.status(200).json(results);
  });
});

//add student
app.post('/add-student',(req,res)=>{
  const {name,age,c_id}=req.body;
  db.query('select * from students where name=?',[name],(err,result)=>{
      if (err) throw err;
      if (result.length>0){
          return res.status(500).json({message:'student with this name already exists'});
      }
      db.query('insert into students(name,age,c_id) values(?,?,?)',[name,age,c_id],(err,result)=>{
      if (err) throw err;
      return res.status(200).json({message:'student added successfully'});
      });
  });
});

//edit students:id
app.put('/edit-student/:id',(req,res)=>{
  const{id}=req.params;
  const{name,age,c_id}=req.body;
  db.query("update students set name=?,age=?,c_id=? where id=?",[name,age,c_id,id],(err,result)=>{
    if(err){
      res.json({message:'SQL error'});
    }
    else{
      res.json({message:'student updated!'});
    }
  })
})

//delete student:id
app.delete('/delete-student/:id',(req,res)=>{
  const {id}=req.params;
  db.query('delete from students where id=?',[id],(err,reslut)=>{
      if(err) throw err;
      return res.json({message:'student delete successfully'});
  });
});

// Create account
app.post('/create-account',(req,res)=>{
  const {username,password}=req.body;
  db.query('select * from users where username=?',[username],(err,result)=>{
      if(err){
          console.error(err);
          return res.status(500).json({message:'database error'});
      }
      if(result.length>0){
          return res.status(409).json({message:'username already taken'});
      }
      db.query('insert into users(username,password) values(?,?)',[username,password],(err,result)=>{
          if (err) {
              console.error(err);
              return res.status(500).json({message:'database error'});
          }
          //automatically if finished to create account you will log in
          
          const {username,password}=req.body;
          db.query('select* from users where username=?',[username],(err,result)=>{
              if(err){
                  console.error(err);
              }
              else{
              if(result.length===0){
                  return res.json({message:'user not found!'});
              }
              else{
                  const user=result[0];
                  if(user.password===password){
                      req.session.user={username:user.username}
                      return res.json({message:'user logged in',username:req.session.user});
                  }
                  else{
                  return res.json({message:'invalid password'});
              }
              }
              }
          });
      });
      });
  });


//logout

app.post('/logout',(req,res)=>{
  req.session.destroy((err)=>{
      if(err){
          return res.json({message:'logout failed'});
  }else{
      res.json({message:'logout successful'});
  }
});
});

//dashboard

app.get('/dashboard',(req,res)=>{
  if(req.session.user){
      res.json(req.session.user);
  }else{
      res.json({message:'not logged in'});
  }
});

app.use((req,res) => {
  return res.status(404).json({message:'Invalid Api'});
});

//forgot password API
app.post('/forgot-password',(req,res)=>{
    const{username,newpassword}=req.query;

    //check if the usename exist in the database
    const checkQuery="SESLECT * FROM users WHERE username=?";
    db.query(checkQuery,[username],(err,result)=>{
        if(err){
            console.error(err);
            return res.status(500).json({message:'database error'});
        }
        if(result.length ===0){

            // usename not found
            return res.status(404).json({message:'username not found'});
        }

        //proceed to update the password for the  user

        const updateQuery='UPDATE users SET password=? WHERE username=?';
        db.query(updateQuery,[newpassword,username],(err,reuslt)=>{
            if(err){
                console.error(err);
                return res.status(500).json({message:'database error'});
            }

            //password reset successful
            res.json({message:'password reset successful'});
        });
    });
});

app.listen(5000,()=>{
  console.log(`bartazahl is running on 5000 port`)
})