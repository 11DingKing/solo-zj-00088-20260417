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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
const Tutorial = db.tutorials;

require("./app/routes/turorial.routes")(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

const FORCE_SYNC = false;

console.log("==================================");
console.log("Starting Server...");
console.log("Database Configuration:");
console.log("  Host:", dbConfig.HOST);
console.log("  Port:", dbConfig.port);
console.log("  User:", dbConfig.USER);
console.log("  Database:", dbConfig.DB);
console.log("==================================");

async function startServer() {
  try {
    console.log("→ Connecting to database...");
    await db.sequelize.authenticate();
    console.log("✓ Database connection established successfully.");

    console.log("→ Synchronizing tables...");
    await db.sequelize.sync({ force: FORCE_SYNC });
    console.log("✓ Database synchronized successfully.");
    
    if (FORCE_SYNC) {
      console.log("⚠️  Warning: Tables were recreated (force: true)");
    }

    const count = await Tutorial.count();
    console.log(`✓ Current tutorials count: ${count}`);

    if (count === 0) {
      console.log("→ Creating sample data...");
      const sampleTutorials = [
        {
          title: "React Basics",
          description: "Learn the fundamentals of React including components, props, state, and lifecycle methods. This comprehensive tutorial will guide you through building your first React application from scratch.",
          published: true
        },
        {
          title: "Node.js Express Tutorial",
          description: "Build RESTful APIs with Node.js and Express framework. Learn about routing, middleware, error handling, and database integration.",
          published: true
        },
        {
          title: "MySQL Database Design",
          description: "Understand relational database design principles with MySQL. Topics include normalization, relationships, indexing, and query optimization.",
          published: false
        },
        {
          title: "JavaScript ES6+ Features",
          description: "Explore modern JavaScript features introduced in ES6 and beyond including arrow functions, destructuring, spread operator, promises, async/await, modules, and more.",
          published: true
        },
        {
          title: "CSS Flexbox Guide",
          description: "Master CSS Flexbox layout for responsive web design.",
          published: false
        }
      ];
      await Tutorial.bulkCreate(sampleTutorials);
      console.log(`✓ Created ${sampleTutorials.length} sample tutorials`);
    }

    const PORT = process.env.NODE_DOCKER_PORT || 8080;
    app.listen(PORT, () => {
      console.log("==================================");
      console.log(`✓ Server is running on port ${PORT}.`);
      console.log("✓ Ready to accept requests.");
      console.log("==================================");
    });

  } catch (err) {
    console.error("==================================");
    console.error("✗ FATAL ERROR: Failed to start server");
    console.error("==================================");
    console.error("Error details:");
    console.error("  Message:", err.message);
    console.error("  Name:", err.name);
    if (err.original) {
      console.error("  Original:", err.original.message);
    }
    console.error("==================================");
    console.error("\nPossible solutions:");
    console.error("1. Ensure MySQL server is running");
    console.error("2. Ensure database 'bezkoder_db' exists");
    console.error("   - Run in MySQL: CREATE DATABASE IF NOT EXISTS bezkoder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    console.error("3. Check database credentials in .env file");
    console.error("4. If using Docker: run 'docker-compose down && docker-compose up --build'");
    console.error("==================================");
    process.exit(1);
  }
}

startServer();
