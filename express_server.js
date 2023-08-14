const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const helpers = require("./helpers");
const app = express();
const PORT = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["secret-key"],
  maxAge: 60 * 60 * 1000, // 1 hour maximum age assigned to cookies
}));

const getUserByEmail = function(email, usersDatabase) {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
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
    id: "BxpWtj",
    email: "feda@email.ca",
    password: "feda",
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
  const userId = req.session.user_id; 
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
  const userId = req.session.user_id; 
  const user = users[userId];
  const userUrls = urlsForUser(userId);

  const templateVars = {
    urls: userUrls,
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id; 
  if (userId) {
    return res.redirect("/urls");
  }
  let templateVars = { user: null };
  res.render("register", templateVars);
});

app.post("/urls", requireLogin, (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session.user_id; 
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", requireLogin, (req, res) => {
  const templateVars = {
    user: users[req.session.user_id], 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", requireLogin, (req, res) => {
  const userId = req.session.user_id; 
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
    longURL: url.longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", requireLogin, (req, res) => {
  const userId = req.session.user_id; 
  const urlIdToDelete = req.params.id;
  const url = urlDatabase[urlIdToDelete];

  if (url && url.userID === userId) {
    delete urlDatabase[urlIdToDelete];
  }

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id; 
  if (userId) {
    return res.redirect("/urls");
  }
  let templateVars = { user: null };
  res.render("login", templateVars);
});

app.post("/urls/:id", requireLogin, (req, res) => {
  const userId = req.session.user_id; 
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

  const user = helpers.getUserByEmail(email, users); 
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password.");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null; 
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  const existingUser = helpers.getUserByEmail(email, users); 
  if (existingUser) {
    return res.status(400).send("Email already registered.");
  }

  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };
  req.session.user_id = userId;
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