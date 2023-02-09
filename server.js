const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser, createMonitor } = require('./services/database');
const { getWeatherData } = require('./services/getWeatherData');
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const APP_SECRET = 'søtt-griseri';


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try{

    const user = await getUserByEmail(email);

    if(!user){
      res.status(401).send({error: 'Unknown user - not found'});
      return;
    }

    if(password !== user.password){
      res.status(401).send({error: 'Wrong password!'});
      return;
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email
    }, Buffer.from(APP_SECRET, 'base64'));

    res.json({ token });

  } catch(error){
    res.status(500).send({error: error.message})
  }
});


app.get('/session', async (req, res) => {
  const token = req.headers['x-token'];
  
  try{
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
    res.json({message: `You are logged in as ${payload.id}`});
  }catch(error){
    res.status(401).send({error: 'Invalid token'});
  }
});

app.post('/createuser', async (req, res) =>{
  const  { name, email, password } = req.body;
  const newUser = await createUser(name, email, password);
  
  res.status(200).send({newUser});
});


/*
// Get weather data test
getWeatherData('2023', '02', '09', '00', '13', '2023', '02', '10', '13', '00', '2', '59.92160104865082', '10.744014548914478');
*/


app.post('/weather', async (req, res) => {
  const {fromYear, fromMonth, fromDay, fromH, fromMin, toYear, toMonth, toDate, toH, toMin, freq, lat, long} = req.body;
  const weatherBack = await getWeatherData(fromYear, fromMonth, fromDay, fromH, fromMin, toYear, toMonth, toDate, toH, toMin, freq, lat, long);
  res.status(200).send({weatherBack});
  console.log(weatherBack);
})


/* 
POST FUNKSJON: for å opprette nye monitorer */
app.post('/createmonitor', async (req, res) =>{
  const token = req.headers.token;
  const params = req.body;
 
  try{   
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
    const userId = payload.id;
    createMonitor(params, userId);
 }catch(error){
   res.status(500).send({error: error});
   console.log(error);
}
});




// Listening to server
app.listen(PORT, () => {
    console.log(`The application is now listening to ${PORT}`)
})