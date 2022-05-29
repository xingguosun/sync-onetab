function onSuccess(googleUser) {
  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
  console.log(error);
}
function renderButton() {
  gapi.signin2.render('my-signin2', {
    'scope': 'profile email',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': onSuccess,
    'onfailure': onFailure
  });
}

document.getElementById("signin").onclick = function () {
  var firebaseConfig = {
    apiKey: "*",
    authDomain: "calab-2e376.firebaseapp.com",
    databaseURL: "https://calab-2e376.firebaseio.com",
    projectId: "calab-2e376",
    storageBucket: "calab-2e376.appspot.com",
    messagingSenderId: "",
    appId: "",
    measurementId: "G-MEASUREMENT_ID",
  };
  
    // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(token);
      console.log(user);
      document.getElementById("signin").textContent(user.email);
      // ...
    }).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.error(errorCode, errorMessage, email, credential);
    });
};
