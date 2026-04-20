require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_ORIGIN,
      "http://localhost:8888",
      "http://127.0.0.1:8888",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8080",
      "http://127.0.0.1:8080"
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked CORS request from:", origin);
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const dbConfig = require("./app/config/db.config");

console.log("Database Configuration:");
console.log("  Host:", dbConfig.HOST);
console.log("  Port:", dbConfig.port);
console.log("  User:", dbConfig.USER);
console.log("  Database:", dbConfig.DB);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("✓ Database connection established successfully.");
    return db.sequelize.sync();
  })
  .then(() => {
    console.log("✓ Database synchronized successfully. Tables created/verified.");
  })
  .catch(err => {
    console.error("✗ Database connection/sync failed:");
    console.error("  Error:", err.message);
    console.error("  Please ensure MySQL is running and the database exists.");
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/turorial.routes")(app);

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
