// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, push, ref, set } from "firebase/database";

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

function writeUserData(userId, name, email, imageUrl) {
    // Create a reference to the user's entries
    const userEntriesRef = ref(db, 'users/' + userId + '/entries');

    console.log("User entries ref:", userEntriesRef);
    // Push creates a new child with a unique auto-generated key
    const newEntryRef = push(userEntriesRef);
    console.log("New entry ref:", newEntryRef);

    // Set the data at the new entry
    set(newEntryRef, {
        username: name,
        email: email,
        profile_picture: imageUrl,
        timestamp: Date.now()
    });
}

function handleButtonClick() {
    console.log("clicked")

    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
        alert('Please log in first!');
        return;
    }

    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const imageUrlInput = document.getElementById('image-url-input');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const imageUrl = imageUrlInput.value.trim();


    if (!name || !email) {
        alert('Please enter both name and email.');
        return
    }

    // Use the authenticated user's unique ID
    const userId = currentUser.uid;
    console.log("User ID:", userId);

    try {
        writeUserData(userId, name, email, imageUrl);
        alert('User data saved successfully!');
        nameInput.value = '';
        emailInput.value = '';
        imageUrlInput.value = '';
    } catch (error) {
        console.error('Error writing user data:', error);
        alert('Failed to save user data. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('click-button');
    if (button) {
        button.addEventListener('click', handleButtonClick);
    }

    // Google Auth setup
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userDetails = document.getElementById('user-details');

    console.log('Login button:', loginButton);
    console.log('Logout button:', logoutButton);
    console.log('User details:', userDetails);

    if (!loginButton || !logoutButton || !userDetails) {
        console.error('One or more elements not found!');
        return;
    }

    const provider = new GoogleAuthProvider();

    // Login with Google
    loginButton.addEventListener('click', () => {
        console.log("Logging in")
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log('User logged in:', result.user);
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert('Login failed: ' + error.message);
            });
    });

    // Logout
    logoutButton.addEventListener('click', () => {
        console.log("Logging out")
        signOut(auth)
            .then(() => {
                console.log('User logged out');
            })
            .catch((error) => {
                console.error('Logout error:', error);
            });
    });

    // Monitor auth state changes
    onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed")
        if (user) {
            // User is logged in
            userDetails.textContent = `Logged in as: ${user.email}`;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
        } else {
            // User is logged out
            userDetails.textContent = 'No User logged in';
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
        }
    });

});