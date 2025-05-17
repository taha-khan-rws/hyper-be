const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const scancontroller = require("./controller/scancontroller")

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());       // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors());                  // Enable CORS
app.use(morgan("dev"));           // Log requests to the console

// Sample Route
app.get("/scan/:sitename", scancontroller);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});