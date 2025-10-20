// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { notesUISetup } from "./notes";
// Import unified authentication (works on both native and web!)
import {
    getPlatform,
    isNativePlatform,
    onAuthStateChanged,
    signInWithGoogle,
    signOut
} from "./auth-unified";

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
// const analytics = getAnalytics(app);
// const auth = getAuth(app);
const db = getDatabase(app);

// Show platform info
console.log('Running on platform:', getPlatform());
console.log('Is native platform:', isNativePlatform());
const debugInfo = document.getElementById('debug-info');
debugInfo.innerText = "Start Debug";


function googleAuthLoginSetup() {
    // Google Auth setup - works on both native and web!
    const loginButton = document.getElementById('login-button');
    debugInfo.innerText += "start auth setup"
    // Login with Google (uses appropriate method for platform)
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            console.log("Logging in...");
            debugInfo.innerText += "\nButton clicked";
            try {
                // This automatically uses native on Android, web popup on browser
                const user = await signInWithGoogle(app);
                console.log('User logged in:', user);
                // Redirect to notes UI after successful login
                window.location.href = 'notes-ui.html';
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed: ' + error.message);
            }
        });
    }
}


function googleAuthLogoutSetup() {
    // Logout button setup (works on both native and web!)
    const logoutButton = document.getElementById('logout-button');

    if (logoutButton) {
        // Logout (uses appropriate method for platform)
        logoutButton.addEventListener('click', async () => {
            console.log("Logging out");
            try {
                await signOut(app);
                console.log('User logged out');
                // Redirect to login page after logout
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    debugInfo.innerText += "\nDOM loaded"
    debugInfo.innerText += "\n" + window.location.pathname
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        console.log("Setting up Google login");
        debugInfo.innerText += "\nSetting up Google login";
        googleAuthLoginSetup();

    }
    if (window.location.pathname.endsWith('notes-ui.html')) {
        console.log("Setting up Google logout");
        googleAuthLogoutSetup();

        onAuthStateChanged(app, async (user) => {
            // alert("Auth state changed: " + (user ? "logged in" : "logged out"));
            if (user) {
                console.log("User already logged in, setting up notes UI");
                debugInfo.innerText += "\nSetting up notes UI";
                notesUISetup(db, user);
            }
        });
    }
});