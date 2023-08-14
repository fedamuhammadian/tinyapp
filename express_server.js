const express = require("express");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  BxpWtj: {
    id:"BxpWtj",
    email :"feda@email.ca",
    password:"feda",
  },
};

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

function requireLogin(req, res, next) {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  next();
}

function urlsForUser(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}


app.get("/urls", requireLogin, (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const userUrls = urlsForUser(userId);
  
  const templateVars = {
    urls: userUrls,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    return res.redirect("/urls");
  }
  let templateVars = { user: null };
  res.render("register", templateVars);
});

app.post("/urls", requireLogin, (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.cookies["user_id"];
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", requireLogin, (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", requireLogin, (req, res) => {
  const userId = req.cookies["user_id"];
  const id = req.params.id;
  const url = urlDatabase[id];
  
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  
  if (url.userID !== userId) {
    return res.status(403).send("Access denied.");
  }
  
  const templateVars = {
    user: users[userId],
    id: id,
    longURL: url.longURL
  };
  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', requireLogin, (req, res) => {
  const userId = req.cookies["user_id"];
  const urlIdToDelete = req.params.id;
  const url = urlDatabase[urlIdToDelete];
  
  if (url && url.userID === userId) {
    delete urlDatabase[urlIdToDelete];
  }
  
  res.redirect('/urls');
});


app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    return res.redirect("/urls");
  }
  let templateVars = { user: null };
  res.render("login", templateVars);
});

app.post("/urls/:id", requireLogin, (req, res) => {
  const userId = req.cookies["user_id"];
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  const url = urlDatabase[id];
  
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  
  if (url.userID !== userId) {
    return res.status(403).send("Access denied.");
  }
  
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = Object.values(users).find(user => user.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password.");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  const existingUser = Object.values(users).find(user => user.email === email);
  if (existingUser) {
    return res.status(400).send("Email already registered.");
  }

  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password

  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword // Store the hashed password
  };
  res.cookie("user_id", userId);
  res.redirect("/urls");
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Page not found.");
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});