const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// const urlDatabase = {
//   b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
// };

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
  };

app.get("/", (req, res) => {
  res.send("Hello!");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  console.log(templateVars.urls);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userObject = urlDatabase[req.params.shortURL];
  let templateVars = { shortURL: req.params.shortURL, longURL: userObject.longURL, user: users[req.cookies["user_id"]]  };
  if (checkUserLog(templateVars.user)) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => { // ---- check
  let userObject = urlDatabase[req.params.shortURL];
  let templateVars = { shortURL: req.params.shortURL, longURL: userObject.longURL, user: users[req.cookies["user_id"]]  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let userObject = urlDatabase[req.params.shortURL];
  let templateVars = { shortURL: req.params.shortURL, longURL: userObject.longURL, user: users[req.cookies["user_id"]] }; 
  res.redirect(templateVars.longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]  }; 
  res.render("urls_register", templateVars)
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]  }; 
  res.render("urls_login", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (registerUser(users, req.body)) {
    let randomID = generateRandomString();
    users[randomID] = { id: randomID, email, password };
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('error')
  }

});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const logInResult = logInUser(users, req.body);
  console.log(logInResult);
  switch (logInResult) {
    case "Bad Email":
      res.status(403);
      res.send("Bad Email");
      break;
    case "Bad Password":
      res.status(403);
      res.send("Bad Password");
      break;
    default:
      res.cookie("user_id", logInResult.id);
      res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

function generateRandomString() {
  const number = Math.floor(Math.random() * Math.pow(10, 6));
	return number;
};

//checks user registration process
function registerUser(users, userInfo) {
  const { email, password } = userInfo;
  for (let user in users) {
    let userData = users[user]
    if (email === userData.email) {
      return null;
    }  
    if (!email || !password) {
      return null;
    }
  }
  return true;
};

//checks login detials for user
function logInUser(users, logInInfo) {
  const { email, password } = logInInfo;
  for (let user in users) {
    let logInData = users[user];
     if (email === logInData.email) {
       if (password === logInData.password) {
          return logInData;
        } else {
          return "Bad Password";
        }
      }
    }
  return "Bad Email"  
};

//function checking if user is logged in 
function checkUserLog(user) {
  if(user) {
    return true;
  } else {
    return false;
  }
};