const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.json());  // These middlewares ensure that I can use 'req.body'
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Database simulation
const database = [
  { id: 1, email: 'user1@email.com', password: '123' },
  { id: 2, email: 'user2@email.com', password: 'abc' },
  { id: 3, email: 'user3@email.com', password: 'xyz' },
]

// Home page.
app.get('/', (req, res) => {
  const { user_id } = req.cookies;
  if (!user_id)  return res.redirect('/login');

  // check if user_id exists in the database;
  const foundUser = database.find(user => user.id === Number(user_id))
  if (!foundUser) return res.redirect('/login');

  const templateData = { user: foundUser }
  return res.render('index', templateData);
});

app.get('/login', (req, res) => {
  return res.render('login');
});

app.post('/api/login', (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;
  const { email, password } = req.body;

  // check if the email exists within the database
  const foundUser = database.find(user => user.email === email)
  if (!foundUser) return res.send(`User with email ${email} does not exists`);

  // check if the password matches the given email
  if (foundUser.password !== password) return res.send('Incorrect password');

  // Somehow, I do something that keeps the user logged In...
  res.cookie('user_id', foundUser.id);
  res.redirect('/');
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

// Listen for requests
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));