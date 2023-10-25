const express = require('express');
const cors = require('cors');
const app = express();
const session = require('express-session');
var admin = require('firebase-admin');
const CryptoJS = require('crypto-js');
var serviceAccount = require("/k.json");

const encryptionKey = 'a88cf7157982d59ec6922f8c92ace9f9276e59508f7c5b378bd970645e7a9893';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://marvelouscybertower-default-rtdb.firebaseio.com"
});

const db = admin.database();
app.use(cors());

// Call middleware, storing a reference to it
app.use(
  session({
    secret: 'your-secret-key', // A secret key for session data encryption
    resave: true,
    saveUninitialized: true,
  })
);
const middle = express.urlencoded({ extended: false })

// Pass it into a route:
app.post('/home', middle, function(req, res) {
   const uname = req.body.uname;
   const pass = req.body.password;
   const pathToCheck = '/Users' +'/'+ uname;

   db.ref(pathToCheck).once('value')
      .then(snapshot => {
         if (snapshot.exists()) {
            const temppass = snapshot.val();
            const p = CryptoJS.AES.decrypt(temppass['pass'],encryptionKey).toString(CryptoJS.enc.Utf8);
            if (pass === p) {
               const passpath = '/Passwords'+'/'+uname;
               db.ref(passpath).once('value')
                  .then(snapshot => {
                    if (snapshot.exists()){
                      const passwords = snapshot.val();
                      
                        let passwordHTML = `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="icon" type="image/png" href="http://127.0.0.1:5501/Images/finallogo.png"><title>${uname} Dashboard</title>
                            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css" />
                            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
                            <link rel="stylesheet" href="http://127.0.0.1:5501/Css/mdb.min.css" />
                            <link rel="stylesheet" href="http://127.0.0.1:5501/css/dashboard.css" />
                            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                            <style>
                                    .modal-dialog {
                                        max-width: 60%;
                                      }
                                    .password-card {
                                        display: flex; /* Use flexbox to create a consistent layout */
                                        justify-content: space-between; /* Distribute content evenly */
                                        align-items: center; /* Center align items vertically */
                                        width: 1350px;
                                        background-color: #f2f2f2;
                                        border: 1px solid #ccc;
                                        padding: 10px;
                                        margin: 10px;
                                        border-radius: 5px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .password-title, .password-username, .password-info {
                                        display: inline; /* Display all text elements horizontally */
                                        margin-right: 92px;
                                    }
                                    .password-actions button {
                                      margin-left: 10px; /* Add space between buttons */
                                    }
                                </style>
                            </head>
                            <body>
                            <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #E3EFF3;">
                            <div class="container-fluid">
                                <a class="navbar-brand" style="display: flex; align-items: center;">
                                    <img src="http://127.0.0.1:5501/Images/finallogo.png" style="width: 20%;">
                                    <form action="http://localhost:5501/home" enctype="application/x-www-form-urlencoded" method="POST">
                                        <input type="hidden" name="uname" value=${uname}>
                                        <input type="hidden" name="password" value=${pass}>
                                        <input type="submit" value="home" class="btn btn-link" style="color:black;">
                                    </form>
                                    <form action="http://localhost:5501/random" enctype="application/x-www-form-urlencoded" method="POST">
                                        <input type="hidden" name="uname" value=${uname}>
                                        <input type="hidden" name="password" value=${pass}>
                                        <input type="submit" value="Password Generator" class="btn btn-link" style="color:black;">
                                    </form>
                                </a>
                                <div class="ml-auto">
                                    <ul class="navbar-nav">
                                        <li class="nav-item dropdown">
                                            <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                                                aria-haspopup="true" aria-expanded="false" style="color: black;">
                                                ${uname}
                                            </a>
                                            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                                <form action="http://localhost:5501/profile" enctype="application/x-www-form-urlencoded" method="POST">
                                                    <input type="hidden" name="uname" value=${uname}>
                                                    <input type="hidden" name="password" value=${pass}>
                                                    <input type="submit" class="dropdown-item" value="Profile">
                                                </form>
                                                <form action="http://localhost:5501/settings" enctype="application/x-www-form-urlencoded" method="POST">
                                                    <input type="hidden" name="uname" value=${uname}>
                                                    <input type="hidden" name="password" value=${pass}>
                                                    <input type="submit" class="dropdown-item" value="Settings">
                                                </form>
                                                <div class="dropdown-divider"></div>
                                                <form action="http://localhost:5501/logout">
                                                    <input type="submit" class="dropdown-item" value="Sign out">
                                                </form>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                            <div class="card">
                              <h5 class="card-header text-center bg-dark text-white fw-bold">Your Passwords</h5>
                            </div>
                            `;

                        for (const passwordKey in passwords) {
                            const password = passwords[passwordKey];
                            const pa = CryptoJS.AES.decrypt(password['Password'],encryptionKey).toString(CryptoJS.enc.Utf8);
                            passwordHTML += `<div class="password-card">
                                <div class="password-title">Website: ${password.Website}</div>
                                <div class="password-username">Username: ${password.Email}</div>
                                <div class="password-info">Password:${pa}</div>
                                <div>
                                    <form action = "http://localhost:5501/ded" enctype="application/x-www-form-urlencoded" method="POST">
                                    <input type="hidden" name="uname" value=${uname}>
                                    <input type="hidden" name="web" value=${password.Website}>
                                    <input type="hidden" name="password" value=${pass}>
                                    <input type="submit" class="btn btn-danger" value="Delete" style="position:relative;">
                                    </form>
                                </div>
                            </div>`;
                        }

                        passwordHTML += `<a  class="btn  btn-primary"  data-toggle="modal" data-target="#addPasswordModal" style='position:relative;left:550px;'>Add a password</a>
                        <div class="modal fade" id="addPasswordModal" tabindex="-1" role="dialog" aria-labelledby="addPasswordModalLabel" aria-hidden="true">
                                  <div class="modal-dialog" role="document">
                                      <div class="modal-content">
                                          <div class="modal-header">
                                              <h5 class="modal-title" id="addPasswordModalLabel">Add a Password</h5>
                                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                  <span aria-hidden="true">&times;</span>
                                              </button>
                                          </div>
                                          <div class="modal-body">
                                              <section class="vh-100" style="background-color: #2779e2;">
                                                <form action="http://localhost:5501/addp" enctype="application/x-www-form-urlencoded" method="POST">
                                                  <div class="container h-100">
                                                    <div class="row d-flex justify-content-center align-items-center h-100">
                                                      <div class="col-xl-9">
                                                
                                                        <h1 class="text-white mb-4" style="position: relative; top:20px;">Add Your Password</h1>
                                                
                                                        <div class="card" style="border-radius: 15px; position: relative; top:20px;">
                                                          <div class="card-body">
                                                
                                                            <div class="row align-items-center pt-4 pb-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Website Name</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="text" class="form-control" rows="1"  name="web" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Username</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                                <input type="hidden"  name="uname" value=${uname}>
                                                                <input type="hidden"  name="password" value=${pass}>
                                                                <input type="text" class="form-control " rows="1" " name="em" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Password</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="password" class="form-control " rows="1"  name="pass" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            </div>
                                                
                                                            
                                                
                                                            <div class="px-5 py-4">
                                                              <button type="submit" class="btn btn-primary btn-lg">Add Password</button>
                                                            </div>
                                                
                                                          </div>
                                                        </div>
                                                
                                                      </div>
                                                    </div>
                                                  </div>
                                                </form>
                                                </section>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                          </div>
                          <script>
                          if(!!window.performance && window.performance.navigation.type === 2){
                              console.log('Reloading');
                           window.location.reload();
                       }</script>                                          
                        </body>
                            </html>`;
                        res.send(passwordHTML);
                    }
                    else{
                      res.send(`<!DOCTYPE html>
                      <html lang="en">
                      <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <link rel="icon" type="image/png" href="http://127.0.0.1:5501/Images/finallogo.png"><title>${uname} Dashboard</title>
                          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css" />
                          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
                          <link rel="stylesheet" href="http://127.0.0.1:5501/Css/mdb.min.css" />
                          <link rel="stylesheet" href="http://127.0.0.1:5501/css/dashboard.css" />
                          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
                          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                          <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                          <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                          <style>
                              .modal-dialog {
                                  max-width: 60%;
                              }
                          </style>
                      </head>
                      <body>
                      <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #E3EFF3;">
                      <div class="container-fluid">
                          <a class="navbar-brand" style="display: flex; align-items: center;">
                              <img src="http://127.0.0.1:5501/Images/finallogo.png" style="width: 20%;">
                              <form action="http://localhost:5501/home" enctype="application/x-www-form-urlencoded" method="POST">
                                  <input type="hidden" name="uname" value=${uname}>
                                  <input type="hidden" name="password" value=${pass}>
                                  <input type="submit" value="home" class="btn btn-link">
                              </form>
                              <form action="http://localhost:5501/random" enctype="application/x-www-form-urlencoded" method="POST">
                                  <input type="hidden" name="uname" value=${uname}>
                                  <input type="hidden" name="password" value=${pass}>
                                  <input type="submit" value="Password Generator" class="btn btn-link">
                              </form>
                          </a>
                          <div class="ml-auto">
                              <ul class="navbar-nav">
                                  <li class="nav-item dropdown">
                                      <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                                          aria-haspopup="true" aria-expanded="false" style="color: black;">
                                          ${uname}
                                      </a>
                                      <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                          <form action="http://localhost:5501/profile" enctype="application/x-www-form-urlencoded" method="POST">
                                              <input type="hidden" name="uname" value=${uname}>
                                              <input type="hidden" name="password" value=${pass}>
                                              <input type="submit" class="dropdown-item" value="Profile">
                                          </form>
                                          <form action="http://localhost:5501/settings" enctype="application/x-www-form-urlencoded" method="POST">
                                              <input type="hidden" name="uname" value=${uname}>
                                              <input type="hidden" name="password" value=${pass}
                                              <input type="submit" class="dropdown-item" value="Settings">
                                          </form>
                                          <div class="dropdown-divider"></div>
                                          <form action="http://localhost:5501/logout">
                                              <input type="submit" class="dropdown-item" value="Sign out">
                                          </form>
                                      </div>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </nav>
                          <div class="card">
                              <h5 class="card-header text-center bg-dark text-white fw-bold">Your Passwords</h5>
                              <div class="card-body"> <p class="card-text">Welcome to Marvelous Cyber Tower, your digital fortress for safeguarding your passwords and online security! 🚀
                      
                                  We're thrilled to have you on board, and we understand that every journey starts with the first step. In this case, your first password!
                                  
                                  You're about to embark on a journey towards a safer and more organized online life. No more sticky notes, no more forgotten passwords. With Marvelous Cyber Tower, you can have peace of mind and easy access to your digital keys.
                                  
                                  So, go ahead and click that "Add Password" button, and let's get you started on this marvelous adventure. Your digital world is just a password away, and we're here to make sure it's a breeze to navigate. 😊🔐
                                  
                                  Once you've added your first password, you'll see how effortlessly you can manage your online security. From then on, Marvelous Cyber Tower will have your back every step of the way. Happy password managing! 💪🌐</p>
                                  <a  class="btn  btn-primary"  data-toggle="modal" data-target="#addPasswordModal">Add a password</a>
                              </div>
                              <div class="modal fade" id="addPasswordModal" tabindex="-1" role="dialog" aria-labelledby="addPasswordModalLabel" aria-hidden="true">
                                  <div class="modal-dialog" role="document">
                                      <div class="modal-content">
                                          <div class="modal-header">
                                              <h5 class="modal-title" id="addPasswordModalLabel">Add a Password</h5>
                                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                  <span aria-hidden="true">&times;</span>
                                              </button>
                                          </div>
                                          <div class="modal-body">
                                              <section class="vh-100" style="background-color: #2779e2;">
                                                <form action="http://localhost:5501/addp" enctype="application/x-www-form-urlencoded" method="POST">
                                                  <div class="container h-100">
                                                    <div class="row d-flex justify-content-center align-items-center h-100">
                                                      <div class="col-xl-9">
                                                
                                                        <h1 class="text-white mb-4" style="position: relative; top:20px;">Add Your First Password</h1>
                                                
                                                        <div class="card" style="border-radius: 15px; position: relative; top:20px;">
                                                          <div class="card-body">
                                                
                                                            <div class="row align-items-center pt-4 pb-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Website Name</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                                <input type="hidden"  name="uname" value=${uname}>
                                                                <input type="hidden" name="password" value=${pass}>
                                                                <input type="text" class="form-control" rows="1"  name="web" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">User name</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="text" class="form-control " rows="1"  name="em" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Password</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="password" class="form-control " rows="1"  name="pass" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            </div>
                                                
                                                            
                                                
                                                            <div class="px-5 py-4">
                                                              <button type="submit" class="btn btn-primary btn-lg">Add Password</button>
                                                            </div>
                                                
                                                          </div>
                                                        </div>
                                                
                                                      </div>
                                                    </div>
                                                  </div>
                                                </form>
                                                </section>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                          </div>
                          <script>
   if(!!window.performance && window.performance.navigation.type === 2){
       console.log('Reloading');
    window.location.reload();
}</script>
                      </body>
                      </html>`) 
                    }
                  })
               
             } else {
               // Passwords don't match, redirect to the signup page
               res.redirect('http://127.0.0.1:5501/login.html?error=Oops, wrong password!');
             }   
         } else {
                  res.send(`<!DOCTYPE html>
                  <html>
                  <head>
                    <link rel="icon" type="image/png" href="/Images/finallogo.png"><title>Login</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
                  </head>
                  <body>
                  <h1>Hmmm....Looks like You are Not registered user...</h1>
                  <img src='http://127.0.0.1:5501/Images/searching.gif'>
                  <div class="spinner-border spinner-border-sm" style="size:200%;"></div>
                  <div class="spinner-grow spinner-grow-sm"></div>
                  
                  <script>
                  setTimeout(function() {
                      window.alert('You are Not a registered user! Register From Here');
                      document.querySelector('.spinner-border').style.display = 'none';
                      document.querySelector('.spinner-grow').style.display = 'none';
                      window.location ='http://127.0.0.1:5501/signup.html';
                  }, 2000); 
                  </script>
                  </body>
                  </html>
                  `)
               }
         })
      .catch(error => {
            console.error('Error checking the path:', error);
      });

});
app.post('/sign', middle, function(req, res) {
  const user = req.body.uname;
  const em = req.body.em;
  const pass = req.body.apass;
  const rpass = req.body.rpass;
  const useref = '/Users';
  db.ref(useref).once('value')
    .then((snapshot) =>{
      const users = snapshot.val();
      const searchkey = user;
      if (users[searchkey]){
        res.redirect('http://127.0.0.1:5501/signup.html?error=Username already exists!')
      }
      else{
        if (rpass == pass){
          const adudata = {
                uname: user,
                pass: CryptoJS.AES.encrypt(pass, encryptionKey).toString(),
                email: em,
              }
          const ref = '/Users' +'/' + user;
          const update = {};
          update[ref] = adudata;
          db.ref().update(update);
          console.log('Registered Successfully!');
          res.redirect('http://127.0.0.1:5501/login.html');   
        }
        else{
          res.redirect('http://127.0.0.1:5501/signup.html?error= Passwords mismatch ')
        }
      }
    })
});
app.post('/addp', middle, function(req, res){
  const web = req.body.web;
  const em = req.body.em;
  const pass = req.body.pass;
  const apass = req.body.password;
  const parts = web.split('.');
  const uname = req.body.uname;
  const pa= '/Passwords' + '/' + uname +'/Website'+'='+parts[0]+ Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
  const ndata = {
        Email : em,
        Password : CryptoJS.AES.encrypt(pass, encryptionKey).toString(),
        Website: web
      }
  console.log(pa);
  db.ref(pa).set(ndata);
  const passpath = '/Passwords' +'/' + uname;
  db.ref(passpath).once('value').then(snapshot =>{
    const passwords = snapshot.val();
                        let passwordHTML = `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="icon" type="image/png" href="http://127.0.0.1:5501/Images/finallogo.png"><title>${uname} Dashboard</title>
                            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css" />
                            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
                            <link rel="stylesheet" href="http://127.0.0.1:5501/Css/mdb.min.css" />
                            <link rel="stylesheet" href="http://127.0.0.1:5501/css/dashboard.css" />
                            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                            <style>
                                    .modal-dialog {
                                        max-width: 60%;
                                      }
                                    .password-card {
                                        display: flex; /* Use flexbox to create a consistent layout */
                                        justify-content: space-between; /* Distribute content evenly */
                                        align-items: center; /* Center align items vertically */
                                        width: 1350px;
                                        background-color: #f2f2f2;
                                        border: 1px solid #ccc;
                                        padding: 10px;
                                        margin: 10px;
                                        border-radius: 5px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .password-title, .password-username, .password-info {
                                        display: inline; /* Display all text elements horizontally */
                                        margin-right: 92px;
                                    }
                                    .password-actions button {
                                      margin-left: 10px; /* Add space between buttons */
                                    }
                                </style>
                            </head>
                            <body>
                            <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #E3EFF3;">
                            <div class="container-fluid">
                                <a class="navbar-brand" style="display: flex; align-items: center;">
                                    <img src="http://127.0.0.1:5501/Images/finallogo.png" style="width: 20%;">
                                    <form action="http://localhost:5501/home" enctype="application/x-www-form-urlencoded" method="POST">
                                        <input type="hidden" name="uname" value=${uname}>
                                        <input type="hidden" name="password" value=${apass}>
                                        <input type="submit" value="home" class="btn btn-link" style="color:black;">
                                    </form>
                                    <form action="http://localhost:5501/random" enctype="application/x-www-form-urlencoded" method="POST">
                                        <input type="hidden" name="uname" value=${uname}>
                                        <input type="hidden" name="password" value=${apass}>
                                        <input type="submit" value="Password Generator" class="btn btn-link" style="color:black;">
                                    </form>
                                </a>
                                <div class="ml-auto">
                                    <ul class="navbar-nav">
                                        <li class="nav-item dropdown">
                                            <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                                                aria-haspopup="true" aria-expanded="false" style="color: black;">
                                                ${uname}
                                            </a>
                                            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                                <form action="http://localhost:5501/profile" enctype="application/x-www-form-urlencoded" method="POST">
                                                    <input type="hidden" name="uname" value=${uname}>
                                                    <input type="hidden" name="password" value=${apass}>
                                                    <input type="submit" class="dropdown-item" value="Profile">
                                                </form>
                                                <form action="http://localhost:5501/settings" enctype="application/x-www-form-urlencoded" method="POST">
                                                    <input type="hidden" name="uname" value=${uname}>
                                                    <input type="hidden" name="password" value=${apass}>
                                                    <input type="submit" class="dropdown-item" value="Settings">
                                                </form>
                                                <div class="dropdown-divider"></div>
                                                <form action="http://localhost:5501/logout">
                                                    <input type="submit" class="dropdown-item" value="Sign out">
                                                </form>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                            <div class="card">
                              <h5 class="card-header text-center bg-dark text-white fw-bold">Your Passwords</h5>
                            </div>
                            `;

                        for (const passwordKey in passwords) {
                            const password = passwords[passwordKey];
                            const pa = CryptoJS.AES.decrypt(password['Password'],encryptionKey).toString(CryptoJS.enc.Utf8);
                            passwordHTML += `<div class="password-card">
                                <div class="password-title">Website: ${password.Website}</div>
                                <div class="password-username">Username: ${password.Email}</div>
                                <div class="password-info">Password:${pa}</div>
                                <div >
                                    <form action = "http://localhost:5501/ded" enctype="application/x-www-form-urlencoded" method="POST">
                                    <input type="hidden" name="uname" value=${uname}>
                                    <input type="hidden" name="web" value=${password.Website}>
                                    <input type="hidden" name="password" value=${apass}>
                                    <input type="submit" class="btn btn-danger" value="Delete" style="position:relative;">
                                    </form>
                                </div>
                            </div>`;
                        }

                        passwordHTML += `<a  class="btn  btn-primary"  data-toggle="modal" data-target="#addPasswordModal" style='position:relative;left:550px;'>Add a password</a>
                        <div class="modal fade" id="addPasswordModal" tabindex="-1" role="dialog" aria-labelledby="addPasswordModalLabel" aria-hidden="true">
                                  <div class="modal-dialog" role="document">
                                      <div class="modal-content">
                                          <div class="modal-header">
                                              <h5 class="modal-title" id="addPasswordModalLabel">Add a Password</h5>
                                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                  <span aria-hidden="true">&times;</span>
                                              </button>
                                          </div>
                                          <div class="modal-body">
                                              <section class="vh-100" style="background-color: #2779e2;">
                                                <form action="http://localhost:5501/addp" enctype="application/x-www-form-urlencoded" method="POST">
                                                  <div class="container h-100">
                                                    <div class="row d-flex justify-content-center align-items-center h-100">
                                                      <div class="col-xl-9">
                                                
                                                        <h1 class="text-white mb-4" style="position: relative; top:20px;">Add Your Password</h1>
                                                
                                                        <div class="card" style="border-radius: 15px; position: relative; top:20px;">
                                                          <div class="card-body">
                                                
                                                            <div class="row align-items-center pt-4 pb-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Website Name</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="text" class="form-control" rows="1" name="web" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">User Name</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                                <input type="hidden"  name="uname" value=${uname}>
                                                                <input type="hidden" name="password" value=${apass}>
                                                                <input type="text" class="form-control " rows="1"  name="em" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Password</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="password" class="form-control " rows="1"  name="pass" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            </div>
                                                
                                                            
                                                
                                                            <div class="px-5 py-4">
                                                              <button type="submit" class="btn btn-primary btn-lg">Add Password</button>
                                                            </div>
                                                
                                                          </div>
                                                        </div>
                                                
                                                      </div>
                                                    </div>
                                                  </div>
                                                </form>
                                                </section>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                          </div>
                          <script>
   if(!!window.performance && window.performance.navigation.type === 2){
       console.log('Reloading');
    window.location.reload();
}</script>
                        </body>
                            </html>`;
                        res.send(passwordHTML);
  })
})
app.post('/ded', middle, function(req, res){
  const uname = req.body.uname;
  const web = req.body.web;
  const apass = req.body.password;
  const parts = web.split('.')
  const path = '/Passwords' +'/' + uname + '/Website=' + parts[0];
  db.ref(path).remove();
  const passpath = '/Passwords' +'/' + uname;
  db.ref(passpath).once('value').then(snapshot =>{
    const passwords = snapshot.val();
                        let passwordHTML = `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="icon" type="image/png" href="http://127.0.0.1:5501/Images/finallogo.png"><title>${uname} Dashboard</title>
                            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css" />
                            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
                            <link rel="stylesheet" href="http://127.0.0.1:5501/Css/mdb.min.css" />
                            <link rel="stylesheet" href="http://127.0.0.1:5501/css/dashboard.css" />
                            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                            <style>
                                    .modal-dialog {
                                        max-width: 60%;
                                      }
                                    .password-card {
                                        display: flex; /* Use flexbox to create a consistent layout */
                                        justify-content: space-between; /* Distribute content evenly */
                                        align-items: center; /* Center align items vertically */
                                        width: 1350px;
                                        background-color: #f2f2f2;
                                        border: 1px solid #ccc;
                                        padding: 10px;
                                        margin: 10px;
                                        border-radius: 5px;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    .password-title, .password-username, .password-info {
                                        display: inline; /* Display all text elements horizontally */
                                        margin-right: 92px;
                                    }
                                    .password-actions button {
                                      margin-left: 10px; /* Add space between buttons */
                                    }
                                </style>
                            </head>
                            <body>
                            <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #E3EFF3;">
                            <div class="container-fluid">
                                <a class="navbar-brand" style="display: flex; align-items: center;">
                                    <img src="http://127.0.0.1:5501/Images/finallogo.png" style="width: 20%;">
                                    <form action="http://localhost:5501/home" enctype="application/x-www-form-urlencoded" method="POST">
                                        <input type="hidden" name="uname" value=${uname}>
                                        <input type="hidden" name="password" value=${apass}>
                                        <input type="submit" value="home" class="btn btn-link" style="color:black;">
                                    </form>
                                    <form action="http://localhost:5501/random" enctype="application/x-www-form-urlencoded" method="POST">
                                        <input type="hidden" name="uname" value=${uname}>
                                        <input type="hidden" name="password" value=${apass}>
                                        <input type="submit" value="Password Generator" class="btn btn-link" style="color:black;">
                                    </form>
                                </a>
                                <div class="ml-auto">
                                    <ul class="navbar-nav">
                                        <li class="nav-item dropdown">
                                            <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                                                aria-haspopup="true" aria-expanded="false" style="color: black;">
                                                ${uname}
                                            </a>
                                            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                                <form action="http://localhost:5501/profile" enctype="application/x-www-form-urlencoded" method="POST">
                                                    <input type="hidden" name="uname" value=${uname}>
                                                    <input type="hidden" name="password" value=${apass}>
                                                    <input type="submit" class="dropdown-item" value="Profile">
                                                </form>
                                                <form action="http://localhost:5501/settings" enctype="application/x-www-form-urlencoded" method="POST">
                                                    <input type="hidden" name="uname" value=${uname}>
                                                    <input type="hidden" name="password" value=${apass}>
                                                    <input type="submit" class="dropdown-item" value="Settings">
                                                </form>
                                                <div class="dropdown-divider"></div>
                                                <form action="http://localhost:5501/logout">
                                                    <input type="submit" class="dropdown-item" value="Sign out">
                                                </form>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                            <div class="card">
                              <h5 class="card-header text-center bg-success text-white fw-bold">Your Passwords</h5>
                            </div>
                            `;

                        for (const passwordKey in passwords) {
                            const password = passwords[passwordKey];
                            const pa = CryptoJS.AES.decrypt(password['Password'],encryptionKey).toString(CryptoJS.enc.Utf8);
                            passwordHTML += `<div class="password-card">
                                <div class="password-title">Website: ${password.Website}</div>
                                <div class="password-username">Username: ${password.Email}</div>
                                <div class="password-info">Password:${pa}</div>
                                <div>
                                
                                    <form action = "http://localhost:5501/ded" enctype="application/x-www-form-urlencoded" method="POST">
                                    <input type="hidden" name="uname" value=${uname}>
                                    <input type="hidden" name="web" value=${password.Website}>
                                    <input type="hidden" name="web" value=${apass}>
                                    <input type="submit" class="btn btn-primary" value="Delete" style="position:relative;">
                                    </form>
                                </div>
                            </div>`;
                        }

                        passwordHTML += `<a  class="btn  btn-primary"  data-toggle="modal" data-target="#addPasswordModal" style='position:relative;left:550px;'>Add a password</a>
                        <div class="modal fade" id="addPasswordModal" tabindex="-1" role="dialog" aria-labelledby="addPasswordModalLabel" aria-hidden="true">
                                  <div class="modal-dialog" role="document">
                                      <div class="modal-content">
                                          <div class="modal-header">
                                              <h5 class="modal-title" id="addPasswordModalLabel">Add a Password</h5>
                                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                  <span aria-hidden="true">&times;</span>
                                              </button>
                                          </div>
                                          <div class="modal-body">
                                              <section class="vh-100" style="background-color: #2779e2;">
                                                <form action="http://localhost:5501/addp" enctype="application/x-www-form-urlencoded" method="POST">
                                                  <div class="container h-100">
                                                    <div class="row d-flex justify-content-center align-items-center h-100">
                                                      <div class="col-xl-9">
                                                
                                                        <h1 class="text-white mb-4" style="position: relative; top:20px;">Add Your Password</h1>
                                                
                                                        <div class="card" style="border-radius: 15px; position: relative; top:20px;">
                                                          <div class="card-body">
                                                
                                                            <div class="row align-items-center pt-4 pb-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Website Name</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="text" class="form-control" rows="1"  name="web" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">User Name</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                                <input type="hidden" name="uname" value=${uname}>
                                                                <input type="hidden" name="password" value=${apass}>
                                                                <input type="text" class="form-control " rows="1"  name="em" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            <hr class="mx-n3">
                                                
                                                            <div class="row align-items-center py-3">
                                                              <div class="col-md-3 ps-5">
                                                
                                                                <h6 class="mb-0">Password</h6>
                                                
                                                              </div>
                                                              <div class="col-md-9 pe-5">
                                                
                                                                <input type="password" class="form-control " rows="1"  name="pass" required/>
                                                
                                                              </div>
                                                            </div>
                                                
                                                            </div>
                                                
                                                            
                                                
                                                            <div class="px-5 py-4">
                                                              <button type="submit" class="btn btn-primary btn-lg">Add Password</button>
                                                            </div>
                                                
                                                          </div>
                                                        </div>
                                                
                                                      </div>
                                                    </div>
                                                  </div>
                                                </form>
                                                </section>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                          </div>
                          <script>
   if(!!window.performance && window.performance.navigation.type === 2){
       console.log('Reloading');
    window.location.reload();
}</script>
                        </body>
                            </html>`;
                        res.send(passwordHTML);
  })
})
app.post('/profile',middle,function(req,res){
  function calculatePasswordStrength(password) {
    const lengthRegex = /.{8,}/; // At least 8 characters
    const digitRegex = /\d/;    // At least one digit
    const lowercaseRegex = /[a-z]/;  // At least one lowercase letter
    const uppercaseRegex = /[A-Z]/;  // At least one uppercase letter
    const specialCharRegex = /[\W_]/; // At least one special character

  // Check the password against each criteria
    const isLengthValid = lengthRegex.test(password);
    const hasDigit = digitRegex.test(password);
    const hasLowercase = lowercaseRegex.test(password);
    const hasUppercase = uppercaseRegex.test(password);
    const hasSpecialChar = specialCharRegex.test(password);

  // Calculate the strength level based on the criteria
    let strengthLevel = 0;

    if (isLengthValid) strengthLevel++;
    if (hasDigit) strengthLevel++;
    if (hasLowercase) strengthLevel++;
    if (hasUppercase) strengthLevel++;
    if (hasSpecialChar) strengthLevel++;
    if(password.length ===16){
      strengthLevel += 16;
    }
  // Determine the strength message based on the strength level

  
    let strengthHTML = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <style>
    .password-strength-indicator {
      display: flex;
  }
    
  .blockr {
      background-color:#FE0000;
      width: 20px;
      height: 20px;
      margin: 0 2px;
      border: 1px solid black;
      border-radius: 3px;
  }
  .block {
      width: 20px;
      height: 20px;
      margin: 0 2px;
      border: 1px solid black;
      border-radius: 3px;
  }
  .blocky{
      background-color: #F8DE22;
      width: 20px;
      height: 20px;
      margin: 0 2px;
      border: 1px solid black;
      border-radius: 3px;
  }
  .blockg{
      background-color: #96C291;
      width: 20px;
      height: 20px;
      margin: 0 2px;
      border: 1px solid black;
      border-radius: 3px;
  }
    </style></head>`;
    if (strengthLevel === 3) {
      // moderate
      strengthHTML += `<body>
      <div class="password-strength-indicator">
                        <div class="blocky"></div>
                        <div class="blocky"></div>
                        <div class="blocky"></div>
                        <div class="block"></div>
                        <div class="block"></div>
                     </div></body></html>`;
    } else if (strengthLevel > 16) {
      // strong
      strengthHTML += `<body><div class="password-strength-indicator">
                        <div class="blockg"></div>
                        <div class="blockg"></div>
                        <div class="blockg"></div>
                        <div class="blockg"></div>
                        <div class="blockg"></div>
                     </div></body></html>`;
    } else {
      // weak
      strengthHTML += `<body><div class="password-strength-indicator">
                        <div class="blockr"></div>
                        <div class="blockr"></div>
                        <div class="block"></div>
                        <div class="block"></div>
                        <div class="block"></div>
                     </div></body></html>`;
    }
    return strengthHTML;
  }
  const uname = req.body.uname;
  const pass = req.body.password;
  const passpath = '/Passwords/'+ uname;
  db.ref(passpath).once('value').then(snapshot =>{
    const passwords = snapshot.val();
    let passwordHTML = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/png" href="http://127.0.0.1:5501/Images/finallogo.png"><title>${uname} Dashboard</title>
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
        <link rel="stylesheet" href="http://127.0.0.1:5501/Css/mdb.min.css" />
        <link rel="stylesheet" href="http://127.0.0.1:5501/css/dashboard.css" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
        <style>
                .modal-dialog {
                    max-width: 60%;
                  }
                .password-card {
                    display: flex; /* Use flexbox to create a consistent layout */
                    justify-content: space-between; /* Distribute content evenly */
                    align-items: center; /* Center align items vertically */
                    width: 1350px;
                    background-color: #f2f2f2;
                    border: 1px solid #ccc;
                    padding: 10px;
                    margin: 10px;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .password-title, .password-username, .password-info {
                    display: inline; /* Display all text elements horizontally */
                    margin-right: 92px;
                }
                .password-actions button {
                  margin-left: 10px; /* Add space between buttons */
                }
            </style>
        </head>
        <body>
        <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #E3EFF3;">
        <div class="container-fluid">
            <a class="navbar-brand" style="display: flex; align-items: center;">
                <img src="http://127.0.0.1:5501/Images/finallogo.png" style="width: 20%;">
                <form action="http://localhost:5501/home" enctype="application/x-www-form-urlencoded" method="POST">
                    <input type="hidden" name="uname" value=${uname}>
                    <input type="hidden" name="password" value=${pass}>
                    <input type="submit" value="home" class="btn btn-link" style="color:black;">
                </form>
                <form action="http://localhost:5501/random" enctype="application/x-www-form-urlencoded" method="POST">
                    <input type="hidden" name="uname" value=${uname}>
                    <input type="hidden" name="password" value=${pass}>
                    <input type="submit" value="Password Generator" class="btn btn-link" style="color:black;">
                </form>
            </a>
            <div class="ml-auto">
                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false" style="color: black;">
                            ${uname}
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <form action="http://localhost:5501/profile" enctype="application/x-www-form-urlencoded" method="POST">
                                <input type="hidden" name="uname" value=${uname}>
                                <input type="hidden" name="password" value=${pass}>
                                <input type="submit" class="dropdown-item" value="Profile">
                            </form>
                            <form action="http://localhost:5501/settings" enctype="application/x-www-form-urlencoded" method="POST">
                                <input type="hidden" name="uname" value=${uname}>
                                <input type="hidden" name="password" value=${pass}>
                                <input type="submit" class="dropdown-item" value="Settings">
                            </form>
                            <div class="dropdown-divider"></div>
                            <form action="http://localhost:5501/logout" enctype="application/x-www-form-urlencoded" method="POST">
                                <input type="submit" class="dropdown-item" value="Sign out">
                            </form>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
        <div class="card">
          <h5 class="card-header text-center bg-dark text-white fw-bold">Your Passwords</h5>
        </div>`;
        for (const passwordKey in passwords) {
          const password = passwords[passwordKey];
          const pa = CryptoJS.AES.decrypt(password['Password'],encryptionKey).toString(CryptoJS.enc.Utf8);
          const passwordStrength = calculatePasswordStrength(pa);
          passwordHTML += `<div class="password-card">
          <div class="password-title">Website: ${password.Website}</div>
          <div class="password-username">Username: ${password.Email}</div>
          <div class="password-info">Password: ${pa}</div>
          <div class="password-strength">Strength: ${passwordStrength}</div>
      </div>`;
        }  
        passwordHTML += `</body>
                    </html>`;
        res.send(passwordHTML);
  });
});
app.get('/logout',middle,function (req, res) {
  // Clear the session data
  req.session.destroy();
  res.redirect('http://127.0.0.1:5501/index.html');
});
app.post('/settings', middle,function(req,res){
  const uname = req.body.uname;
  const apass = req.body.password;
  const path = '/Passwords/'+uname;
  db.ref(path).once('value').then(snapshot =>{
    const nump = snapshot.numChildren();
    let phtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <link rel="stylesheet" href="/Css/pass.css">
      <link rel="stylesheet" href="/Css/mdb.min.css">
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
      <link rel="stylesheet" href="http://127.0.0.1:5501/Css/mdb.min.css" />
      <link rel="stylesheet" href="http://127.0.0.1:5501/css/dashboard.css" />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
      <link rel="icon" type="image/png" href="http://127.0.0.1:5501/Images/finallogo.png"><title>${uname} Dashboard</title>
      <style>
      .container1 {
          text-align: center;
          margin-top: 50px;
      }
      h2 {
          font-size: 24px;
      }
      p {
          font-size: 16px;
      }
      button {
          background-color: #FF0000;
          color: #FFFFFF;
          font-size: 16px;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
      }
  </style>
  </head>
  <body>
  <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #E3EFF3;">
  <div class="container-fluid">
      <a class="navbar-brand" style="display: flex; align-items: center;">
          <img src="http://127.0.0.1:5501/Images/finallogo.png" style="width: 20%;">
          <form action="http://localhost:5501/home" enctype="application/x-www-form-urlencoded" method="POST">
              <input type="hidden" name="uname" value=${uname}>
              <input type="hidden" name="password" value=${apass}>
              <input type="submit" value="home" class="btn btn-link" style="color:black;">
          </form>
          <form action="http://localhost:5501/random" enctype="application/x-www-form-urlencoded" method="POST">
              <input type="hidden" name="uname" value=${uname}>
              <input type="hidden" name="password" value=${apass}>
              <input type="submit" value="Password Generator" class="btn btn-link" style="color:black;">
          </form>
      </a>
      
  </div>
</nav>
      <h5 class="display-6 text-lg-center">Marvelous Cyber knight Name:${uname}</h5>
      <h5 class="display-6 text-lg-center">No.of Passwords Stored:${nump}</h5>
      <hr style="border: 3px  solid darkred;">
      <div class="container">
          <h2 class="mt-5">Before You Say Goodbye: Deleting Your Marvelous Cyber Tower Account</h2>
          <p>We understand that situations may arise where you need to part ways with Marvelous Cyber Tower. Deleting your account is a significant decision, so we want to ensure you have all the necessary information to make an informed choice.</p>
          <p><strong>Data Safety:</strong> Your security and privacy are our top priorities. Before proceeding, remember that once your account is deleted, all your data, passwords, and personal information will be permanently removed from our servers. This action cannot be undone.</p>
          <p><strong>Seeking Assistance:</strong> If you're experiencing any issues or have concerns about your account, we encourage you to reach out to our support team. We're here to help resolve any problems you may be facing.</p>
          <p><strong>Feedback Welcome:</strong> We value your input. If there's anything that made you consider deleting your account, please let us know. Your feedback can help us improve Marvelous Cyber Tower for all our users.</p>
          <p><strong>Proceed with Caution:</strong> If you still wish to delete your account, click the button below. It will initiate the account deletion process.</p>
          <form action="http://localhost:5501/delete" enctype="application/x-www-form-urlencoded" method="POST">
              <input type="hidden" name="uname" value="${uname}">
              <input type="submit" class="btn btn-danger mt-3" value="Delete My Account" style="position: relative; left:400px;">
          </form>
          <br>
      </div>
  
      <!-- Add Bootstrap JS and jQuery links for enhanced functionality -->
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
  </body>
  </html>`;
  res.send(phtml);
  })
})
app.post('/delete', middle,function(req,res){
  const uname = req.body.uname;
  const ppath = '/Passwords/' + uname;
  const upath = '/Users/' + uname;
  db.ref(upath).remove();
  db.ref(ppath).remove();
  res.redirect('http://127.0.0.1:5501/index.html');
})
app.post('/random', middle, function(req,res){
  const uname = req.body.uname;
  const apass = req.body.password;
  const rhtml=`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" type="image/png" href="http://127.0.0.1:5501/Images/finallogo.png"><title>${uname} Dashboard</title>
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.11.2/css/all.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
      <link rel="stylesheet" href="http://127.0.0.1:5501/Css/mdb.min.css" />
      <link rel="stylesheet" href="http://127.0.0.1:5501/css/dashboard.css" />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      <style>
              .modal-dialog {
                  max-width: 60%;
                }
              .password-card {
                  display: flex; /* Use flexbox to create a consistent layout */
                  justify-content: space-between; /* Distribute content evenly */
                  align-items: center; /* Center align items vertically */
                  width: 1350px;
                  background-color: #f2f2f2;
                  border: 1px solid #ccc;
                  padding: 10px;
                  margin: 10px;
                  border-radius: 5px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .password-title, .password-username, .password-info {
                  display: inline; /* Display all text elements horizontally */
                  margin-right: 92px;
              }
              .password-actions button {
                margin-left: 10px; /* Add space between buttons */
              }
          </style>
      </head>
      <body>
      <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #E3EFF3;">
      <div class="container-fluid">
          <a class="navbar-brand" style="display: flex; align-items: center;">
              <img src="http://127.0.0.1:5501/Images/finallogo.png" style="width: 20%;">
              <form action="http://localhost:5501/home" enctype="application/x-www-form-urlencoded" method="POST">
                  <input type="hidden" name="uname" value=${uname}>
                  <input type="hidden" name="password" value=${apass}>
                  <input type="submit" value="home" class="btn btn-link" style="color:black;">
              </form>
              <form action="http://localhost:5501/random" enctype="application/x-www-form-urlencoded" method="POST">
                  <input type="hidden" name="uname" value=${uname}>
                  <input type="hidden" name="password" value=${apass}>
                  <input type="submit" value="Password Generator" class="btn btn-link" style="color:black;">
              </form>
          </a>
          <div class="ml-auto">
              <ul class="navbar-nav">
                  <li class="nav-item dropdown">
                      <a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"
                          aria-haspopup="true" aria-expanded="false" style="color: black;">
                          ${uname}
                      </a>
                      <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                          <form action="http://localhost:5501/profile" enctype="application/x-www-form-urlencoded" method="POST">
                              <input type="hidden" name="uname" value=${uname}>
                              <input type="submit" class="dropdown-item" value="Profile">
                          </form>
                          <form action="http://localhost:5501/settings" enctype="application/x-www-form-urlencoded" method="POST">
                              <input type="hidden" name="uname" value=${uname}>
                              <input type="submit" class="dropdown-item" value="Settings">
                          </form>
                          <div class="dropdown-divider"></div>
                          <form action="http://localhost:5501/logout">
                              <input type="submit" class="dropdown-item" value="Sign out">
                          </form>
                      </div>
                  </li>
              </ul>
          </div>
      </div>
  </nav>
      <div class="card">
        <h5 class="card-header text-center bg-dark text-white fw-bold" >Your Password</h5>
      </div>
      <div class="container mt-5">
          <div class="row justify-content-center">
              <div class="col-md-6">
                  <div class="card">
                      <div class="card-body text-center">
                          <h2 class="card-title">Random Password Generator</h2>
                          <p class="card-text">Click the button to generate a random password:</p>
                          <p class="card-text"><span id="passwordValue"></span></p>
                          <button class="btn btn-primary" id="generateButton">Generate Password</button>
                          <a  class="btn  btn-primary"  data-toggle="modal" data-target="#addPasswordModal">Add This password</a>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="modal fade" id="addPasswordModal" tabindex="-1" role="dialog" aria-labelledby="addPasswordModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="addPasswordModalLabel">Add a Password</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <section class="vh-100" style="background-color: #2779e2;">
                        <form action="http://localhost:5501/addp" enctype="application/x-www-form-urlencoded" method="POST">
                          <div class="container h-100">
                            <div class="row d-flex justify-content-center align-items-center h-100">
                              <div class="col-xl-9">
                        
                                <h1 class="text-white mb-4" style="position: relative; top:20px;">Add Your Password</h1>
                        
                                <div class="card" style="border-radius: 15px; position: relative; top:20px;">
                                  <div class="card-body">
                        
                                    <div class="row align-items-center pt-4 pb-3">
                                      <div class="col-md-3 ps-5">
                        
                                        <h6 class="mb-0">Website Name</h6>
                        
                                      </div>
                                      <div class="col-md-9 pe-5">
                        
                                        <input type="text" class="form-control" rows="1"  name="web" required/>
                        
                                      </div>
                                    </div>
                        
                                    <hr class="mx-n3">
                        
                                    <div class="row align-items-center py-3">
                                      <div class="col-md-3 ps-5">
                        
                                        <h6 class="mb-0">Username</h6>
                        
                                      </div>
                                      <div class="col-md-9 pe-5">
                                        <input type="hidden" name="uname" value=${uname}>
                                        <input type="hidden" name="password" value=${apass}>
                                        <input type="text" class="form-control " rows="1" " name="em"  required/>
                        
                                      </div>
                                    </div>
                        
                                    <hr class="mx-n3">
                        
                                    <div class="row align-items-center py-3">
                                      <div class="col-md-3 ps-5">
                        
                                        <h6 class="mb-0">Password</h6>
                        
                                      </div>
                                      <div class="col-md-9 pe-5">
                        
                                        <input type="password" class="form-control " rows="1"  name="pass" id="passwordInput" required/>
                        
                                      </div>
                                    </div>
                        
                                    </div>
                        
                                    
                        
                                    <div class="px-5 py-4">
                                      <button type="submit" class="btn btn-primary btn-lg">Add Password</button>
                                    </div>
                        
                                  </div>
                                </div>
                        
                              </div>
                            </div>
                          </div>
                        </form>
                        </section>
                      </div>
                  </div>
              </div>
          </div>
  </div>
      <script>
          function generateRandomPassword(length) {
              const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}|;:,.<>?";
              let password = "";
      
              if (length > charset.length) {
                  return "Password length exceeds character set size";
              }
      
              while (password.length < length) {
                  const randomIndex = Math.floor(Math.random() * charset.length);
                  const character = charset[randomIndex];
      
                  if (!password.includes(character)) {
                      password += character;
                  }
              }
      
              return password;
          }
      
          // Function to generate and display the password
          function generateAndDisplayPassword() {
              const passwordValue = generateRandomPassword(16);
              document.getElementById("passwordValue").textContent = passwordValue;
               document.getElementById("passwordInput").value = passwordValue;
          }
      
          // Add click event listeners to the buttons
          document.getElementById("generateButton").addEventListener("click", generateAndDisplayPassword);
      
          // Generate and display the password when the page loads
          generateAndDisplayPassword();
      </script>                
</body>
</html> `
res.send(rhtml);
})
console.log("port is running at 5501")
app.listen(5501);