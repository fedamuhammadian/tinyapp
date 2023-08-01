const express = require("express");
const app = express();
const PORT = 8080; 
app.set("view engine", "ejs");
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
app.get("/urls/:id", (req, res) => {
    /* const id = req.params.id;
  const longURL = urlDatabase[id]; // Replace ?? with the correct code to get the longURL
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);*/
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL/* What goes here? */ };
  res.render("urls_show", templateVars);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});