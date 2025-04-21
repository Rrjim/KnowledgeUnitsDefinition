import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import cors from "cors";
import env from "dotenv";
import passport from "passport";
import authMiddleware from './middlewares/authMiddleware.js'; 


// Import Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/appRoutes.js";

// Import Passport Config
import "./config/passportConfig.js";

// Load Environment Variables
env.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000, httpOnly: true },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
