const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { getUserByUsername } = require('./services/database');
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const APP_SECRET = 'søtt-griseri';


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try{

    const user = await getUserByUsername(username);

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
      username: user.username
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
    res.json({message: `You are logged in as ${payload.username}`});
  }catch(error){
    res.status(401).send({error: 'Invalid token'});
  }
});

// Listening to server
app.listen(PORT, () => {
    console.log(`The application is now listening to ${PORT}`)
})