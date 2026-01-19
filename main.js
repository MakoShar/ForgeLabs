  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  import { getAuth, GoogleAuthProvider,signInWithPopup } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  const firebaseConfig = {
    apiKey: "AIzaSyBTwNDNgQDUgYMuWPCqNW9GGxUHOXgIJZo",
    authDomain: "forgelabs-login.firebaseapp.com",
    projectId: "forgelabs-login",
    storageBucket: "forgelabs-login.firebasestorage.app",
    messagingSenderId: "739329519756",
    appId: "1:739329519756:web:4558f74be648845466cba9"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  auth.languageCode = 'en';
  const provider = new GoogleAuthProvider();
  const googleLoginBtn = document.getElementById("google-login-btn");
  googleLoginBtn.addEventListener("click", function() {
    signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      console.log("User Info:", user);
      window.location.href = "../Dashboard.html";
  }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
  });
})