  import express from "express";
  import bodyParser from "body-parser";
  import pg from "pg";
  import bcrypt from "bcrypt";
  import passport from "passport";
  import { Strategy } from "passport-local";
  import GoogleStrategy from "passport-google-oauth2";
  import session from "express-session";
  import env from "dotenv";
  import cors from 'cors';


  const app = express();
  const port = 3000;
  const saltRounds = 10;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{10,}$/; 

  env.config();

  app.use(cors({
    origin: 'http://localhost:5174',  // React
    methods: ['GET', 'POST'],        
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true,
  }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 60 * 60 * 1000,  // Set cookie expiration (1 hour)
        httpOnly: true,           // Make sure cookie can't be accessed via JavaScript
        secure: process.env.NODE_ENV === "production", // Send cookie only over HTTPS in production
      },
    })
  );
  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json()); // for handling JSON requests

  app.use(express.static("public"));

  app.use(passport.initialize());
  app.use(passport.session());

  const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  db.connect();

  app.get("/", (req, res) => {
    res.render("home.ejs");
  });

  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google OAuth Callback (Redirects back to React)
app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "http://localhost:5174/login" }),
  (req, res) => {
    res.redirect("http://localhost:5174/secrets");
  }
);


app.get("/api/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // Clears the session cookie
      res.json({ message: "Logout successful" }); // Send response to React
      console.log(req.session);
    });
  });
});


  app.get("/api/secrets", async (req, res) => {
    console.log(req.user);

    ////////////////UPDATED GET SECRETS ROUTE/////////////////
    if (req.isAuthenticated()) {
      try {
        const result = await db.query(
          `SELECT secret FROM users WHERE email = $1`,
          [req.user.email]
        );
        console.log(result);
        const secret = result.rows[0].secret;
        if (secret) {
          res.render("secrets.ejs", { secret: secret });
        } else {
          res.render("secrets.ejs", { secret: "Jack Bauer is my hero." });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      res.redirect("/login");
    }
  });

  ////////////////SUBMIT GET ROUTE/////////////////
  app.get("/api/submit", function (req, res) {
    if (req.isAuthenticated()) {
      res.render("submit.ejs");
    } else {
      res.redirect("/api/login");
    }
  });

  app.get("/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });
  

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/auth/google/secrets",
    passport.authenticate("google", {
      successRedirect: "/secrets",
      failureRedirect: "/login",
    })
  );

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received with data:", req.body);  // Debug log
    
    passport.authenticate("local", (err, user, info) => {
      console.log("Authentication result:", { err, user, info });
  
      if (err) {
        return res.status(500).json({ authenticated: false, message: "Server error" });
      }
      if (!user) {
        return res.status(401).json({ authenticated: false, message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ authenticated: false, message: "Login failed" });
        }
        return res.json({ authenticated: true, message: "Login successful", user });
      });
    })(req, res, next);
  });
  
  

  app.post("/api/register", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirm = req.body.confirm;
  
    // console.log("Received email:", email);
    // console.log("Received password:", password);
    // console.log("SaltRounds:", saltRounds);
  
    try {
      // Check if the user already exists
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Ensure password is valid before proceeding
      if (!password || password.trim() === "") {
        return res.status(400).json({ message: "Password is required" });
      }

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 10 characters long, contain at least one uppercase letter, and one special character.",
        });
    }  
      if(password != confirm) {
        console.log(confirm);
        console.log(password);
        return res.status(400).json({
          message: "Password failed to be confirmed"
        })
      }
      // Ensure saltRounds is valid
      if (!saltRounds || typeof saltRounds !== "number") {
        return res.status(500).json({ message: "Invalid saltRounds configuration" });
      }
  
      const hash = await bcrypt.hash(password, saltRounds);
  
      const result = await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hash]
      );
  
      const user = result.rows[0];
  
      // Log in the user immediately after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Error during login:", err); // Logging for debugging
          return res.status(500).json({ message: "Error during login" });
        }
  
        // Respond with the success message and user data
        return res.status(200).json({
          authenticated: true,
          message: "Registration successful",
          user: { email: user.email, id: user.id },
        });
      });
    } catch (err) {
      console.error("Error during registration:", err); // This will help debug any errors during registration
      return res.status(500).json({ message: "Server error during registration" });
    }
  });
  
  ////////////////SUBMIT POST ROUTE/////////////////
  app.post("/api/submit", async function (req, res) {
    const submittedSecret = req.body.secret;
    console.log(req.user);
    try {
      await db.query(`UPDATE users SET secret = $1 WHERE email = $2`, [
        submittedSecret,
        req.user.email,
      ]);
      res.redirect("/secrets");
    } catch (err) {
      console.log(err);
    }
  });


 // 🟢 PASSPORT CONFIGURATION 🟢
 passport.use(
  "local",
  new Strategy(
    { usernameField: "email", passwordField: "password" }, // 👈 Explicitly set fields
    async function verify(email, password, cb) {
      try {
        console.log("Entering local strategy...");
        console.log("Email received:", email);
        console.log("Password received:", password);

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;

          console.log("Stored hashed password:", storedHashedPassword);

          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            }
            if (valid) {
              console.log("Password matches! User authenticated.");
              return cb(null, user);
            } else {
              console.log("Password does NOT match.");
              return cb(null, false, { message: "Invalid credentials" });
            }
          });
        } else {
          console.log("User not found in database.");
          return cb(null, false, { message: "User not found" });
        }
      } catch (err) {
        console.error("Error during authentication:", err);
        return cb(err);
      }
    }
  )
);



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);

        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [profile.email, "google"]
          );
          return done(null, newUser.rows[0]);
        } else {
          return done(null, result.rows[0]);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
