// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { notesUISetup } from "./notes";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDi93TQQlD0CQyjEc0zYxiyVEXLzSasLu0",
    authDomain: "simple-note-app-a262d.firebaseapp.com",
    databaseURL: "https://simple-note-app-a262d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "simple-note-app-a262d",
    storageBucket: "simple-note-app-a262d.firebasestorage.app",
    messagingSenderId: "197885263135",
    appId: "1:197885263135:web:50583b0bb56812f2aec42a",
    measurementId: "G-329Q44H54V",
    databaseURL: "https://simple-note-app-a262d-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);



function googleAuthSetup() {
    // Google Auth setup
    const provider = new GoogleAuthProvider();
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button')

    // Login with Google
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            console.log("Logging in")
            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log('User logged in:', result.user);
                    // Redirect to notes UI after successful login
                    window.location.href = 'notes-ui.html';
                })
                .catch((error) => {
                    console.error('Login error:', error);
                    alert('Login failed: ' + error.message);
                });
        });
    }

    if (logoutButton) {
        // Logout
        logoutButton.addEventListener('click', () => {
            console.log("Logging out")
            signOut(auth)
                .then(() => {
                    console.log('User logged out');
                    // Redirect to notes UI after successful login
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('Logout error:', error);
                });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    googleAuthSetup();

    // Wait for auth state to be ready before setting up notes UI
    onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed, user:", user);

        // Check if we're on notes-ui.html and user is not logged in
        if (!user && window.location.pathname.endsWith('notes-ui.html')) {
            console.log("Not logged in on notes page, redirecting to login");
            window.location.href = 'index.html';
            return;
        }

        // Setup notes UI (will only work if elements exist on the page)
        notesUISetup(auth, db);
    });
});