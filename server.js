const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  getUserByEmail,
  createUser,
  updatePassword,
  createAlertsFromMonitorCheck,
  getAlertsByUserId,
  deleteAlert,
  createMonitor,
  getMonitorsByUserId,
  deleteMonitor,
} = require("./services/database");

const {
  compareMonitorToAPI,
  checkAllMonitors,
} = require("./services/WeatherCheck");

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const APP_SECRET = "søtt-griseri";

//getUserByEmail - login
//createUser - singup
//updatePassword - settings

//createAlerts - alert
//getAlertsByUserId - alert
//deleteAlert - alert

//createMonitor - monitor
//getMonitor - monitor
//getMonitorsByUserId - monitor
//deleteMonitor - monitor

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      res.status(401).send({ error: "Unknown user - not found" });
      return;
    }

    if (password !== user.password) {
      res.status(401).send({ error: "Wrong password!" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      Buffer.from(APP_SECRET, "base64")
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/session", async (req, res) => {
  const token = req.headers.token;

  try {
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, "Base64"));
    res.json({ message: `You are logged in as ${payload.email}` });
  } catch (error) {
    res.status(401).send({ error: "Invalid token" });
  }
});

app.post("/createuser", async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = await createUser(name, email, password);

  res.status(200).send({ newUser });
});

//CreateNewAlert in database
app.post("/createAlert", async (req, res) => {
  const params = req.body;
  try {
    const newAlert = await createAlerts(params, userId);
    res.status(200).send({ newAlert });
  } catch (error) {
    res.status(500).send({ error: error });
    console.log(error);
  }
});

app.put("/updatepassword", async (req, res) => {
  const { token } = req.headers;
  const { oldPassword, newPassword } = req.body;

  try {
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, "Base64"));
    const userId = payload.id;
    const email = payload.email;

    await updatePassword(oldPassword, newPassword, userId);
    res
      .status(200)
      .json({ message: `Password for user with email:${email} is updated!` });
  } catch (error) {
    res.status(500).send({ error: error });
    console.log(error);
  }
});

//Hente alerts basert på bruker-id
app.get("/", async (req, res) => {
  const token = req.headers.token;
  const payload = jwt.verify(token, Buffer.from(APP_SECRET, "Base64"));
  const userId = payload.id;

  const userAlerts = await getAlertsByUserId(userId);

  res.send(userAlerts);
});

app.delete("/", async (req, res) => {
  //Hente alert Id fra den enkelte alert
  //hentes gjennom state til headers eller body
  //kjøre delete fuksjon med alertID
  //deleteAlert (alertID)
});

/* 
POST FUNKSJON: for å opprette nye monitorer */
app.post("/createmonitor", async (req, res) => {
  const token = req.headers.token;
  const params = req.body;

  try {
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, "Base64"));
    const userId = payload.id;
    createMonitor(params, userId);
  } catch (error) {
    res.status(500).send({ error: error });
    console.log(error);
  }
});

app.get("/monitors", async (req, res) => {
  const token = req.headers.token;
  const payload = jwt.verify(token, Buffer.from(APP_SECRET, "Base64"));
  const userId = payload.id;
  const userMonitors = await getMonitorsByUserId(userId);

  res.send(userMonitors);
});

app.delete("/monitors", async (req, res) => {
  try {
    const { monitorId } = req.body;

    await deleteMonitor(monitorId);
  } catch (err) {
    res.status(500).send({ err });
    console.log(err);
  }
});

app.get("/alerts", async (req, res) => {
  const token = req.headers.token;
  const payload = jwt.verify(token, Buffer.from(APP_SECRET, "Base64"));
  const userId = payload.id;

  const userAlerts = await getAlertsByUserId(userId);

  res.send(userAlerts);
});

app.delete("/alerts", async (req, res) => {
  try {
    const { alertId } = req.body;

    await deleteAlert(alertId);
  } catch (err) {
    res.status(500).send({ err });
    console.log(err);
  }
});

//checkAllMonitors();

// Listening to server
app.listen(PORT, () => {
  console.log(`The application is now listening to ${PORT}`);
});
