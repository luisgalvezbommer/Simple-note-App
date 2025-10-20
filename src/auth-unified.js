// Unified Authentication Module
// Uses Capacitor (native) on Android/iOS, Firebase Web SDK on browser

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import {
    GoogleAuthProvider,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    signOut as firebaseSignOut,
    getAuth,
    signInWithPopup
} from 'firebase/auth';

// Determine if we're on a native platform
const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();

console.log(`[Auth] Platform: ${platform}, Native: ${isNative}`);

const debugInfo = document.getElementById('debug-info');
/**
 * Sign in with Google
 * Uses native on Android/iOS, web popup on browser
 */
export async function signInWithGoogle(firebaseApp) {
    debugInfo.innerText += "\nSigning in"
    if (isNative) {
        // Native platform - use Capacitor
        console.log('[Auth] Using Capacitor native sign-in');
        try {
            const result = await FirebaseAuthentication.signInWithGoogle();
            console.log('[Auth] Native sign-in successful:', result.user);
            if (debugInfo) {
                debugInfo.innerText += `\nUser ID: ${result.user?.uid}\nEmail: ${result.user?.email}`;
            }
            return result.user;
        } catch (error) {
            console.error('[Auth] Native sign-in error:', error);
            throw error;
        }
    } else {
        // Web platform - use Firebase Web SDK
        console.log('[Auth] Using Firebase Web SDK sign-in');
        const auth = getAuth(firebaseApp);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('[Auth] Web sign-in successful:', result.user);
            return result.user;
        } catch (error) {
            console.error('[Auth] Web sign-in error:', error);
            throw error;
        }
    }
}

/**
 * Sign out
 * Works on both native and web
 */
export async function signOut(firebaseApp) {
    if (isNative) {
        // Native platform - use Capacitor
        console.log('[Auth] Using Capacitor native sign-out');
        try {
            await FirebaseAuthentication.signOut();
            console.log('[Auth] Native sign-out successful');
        } catch (error) {
            console.error('[Auth] Native sign-out error:', error);
            throw error;
        }
    } else {
        // Web platform - use Firebase Web SDK
        console.log('[Auth] Using Firebase Web SDK sign-out');
        const auth = getAuth(firebaseApp);
        try {
            await firebaseSignOut(auth);
            console.log('[Auth] Web sign-out successful');
        } catch (error) {
            console.error('[Auth] Web sign-out error:', error);
            throw error;
        }
    }
}

/**
 * Get current user
 * Works on both native and web
 */
export async function getCurrentUser(firebaseApp) {
    if (isNative) {
        // Native platform - use Capacitor
        try {
            const result = await FirebaseAuthentication.getCurrentUser();
            console.log('[Auth] Native getCurrentUser:', result.user);
            return result.user;
        } catch (error) {
            console.error('[Auth] Native getCurrentUser error:', error);
            return null;
        }
    } else {
        try {
            console.log("FirebaseApp: ", firebaseApp);
            // Web platform - use Firebase Web SDK
            const auth = getAuth(firebaseApp);
            console.log("Auth: ", auth);
            const user = auth.currentUser;
            console.log("User: ", user);
            console.log('[Auth] Web getCurrentUser:', user);
            return user;
        } catch (error) {
            console.error('[Auth] Web getCurrentUser error:', error);
            return null;
        }
    }
}

/**
 * Listen for auth state changes
 * Works on both native and web
 * @param {Function} callback - Called when auth state changes
 * @param {Object} firebaseApp - Firebase app instance
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChanged(firebaseApp, callback) {
    if (isNative) {
        // Native platform - use Capacitor
        console.log('[Auth] Setting up native auth state listener');
        const listener = FirebaseAuthentication.addListener('authStateChange', (change) => {
            console.log('[Auth] Native auth state changed:', change.user);
            callback(change.user);
        });

        // Return unsubscribe function
        return () => {
            console.log('[Auth] Removing native auth state listener');
            listener.remove();
        };
    } else {
        // Web platform - use Firebase Web SDK
        console.log('[Auth] Setting up web auth state listener');
        const auth = getAuth(firebaseApp);
        return firebaseOnAuthStateChanged(auth, (user) => {
            console.log('[Auth] Web auth state changed:', user);
            callback(user);
        });
    }
}

/**
 * Check if app is running on native platform
 */
export function isNativePlatform() {
    return isNative;
}

/**
 * Get platform name
 */
export function getPlatform() {
    return platform;
}
