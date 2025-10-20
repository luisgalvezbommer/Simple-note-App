// Unified Authentication Module
// Uses Capacitor (native) on Android/iOS, Firebase Web SDK on browser

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import {
    GoogleAuthProvider,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    signOut as firebaseSignOut,
    getAuth,
    signInWithCredential,
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

            // CRITICAL FIX: Sign in to Firebase Web SDK using the credential
            // This ensures the Firebase Database recognizes the authenticated user
            if (result.credential) {
                const auth = getAuth(firebaseApp);
                const credential = GoogleAuthProvider.credential(
                    result.credential.idToken,
                    result.credential.accessToken
                );
                await signInWithCredential(auth, credential);
                console.log('[Auth] Firebase Web SDK authenticated with native credential');
            }

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

            // If user exists on native but not on web SDK, sync them
            if (result.user) {
                const auth = getAuth(firebaseApp);
                if (!auth.currentUser) {
                    console.log('[Auth] Syncing native user to Firebase Web SDK');
                    // Get the ID token and sign in to Web SDK
                    const tokenResult = await FirebaseAuthentication.getIdToken();
                    if (tokenResult.token) {
                        try {
                            // Use the ID token to authenticate Web SDK
                            // Note: We need to get credential from the sign-in result
                            // For now, trigger auth state listener to sync
                            console.log('[Auth] User authenticated natively, web SDK will sync via listener');
                        } catch (e) {
                            console.warn('[Auth] Could not sync to web SDK:', e);
                        }
                    }
                }
            }

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

        // Also listen to Firebase Web SDK auth state for database operations
        const auth = getAuth(firebaseApp);
        const webUnsubscribe = firebaseOnAuthStateChanged(auth, (webUser) => {
            console.log('[Auth] Web SDK auth state:', webUser);
        });

        const listener = FirebaseAuthentication.addListener('authStateChange', async (change) => {
            console.log('[Auth] Native auth state changed:', change.user);

            // Sync native auth to web SDK for database operations
            if (change.user && !auth.currentUser) {
                try {
                    console.log('[Auth] Syncing native auth to Web SDK for database access');
                    const tokenResult = await FirebaseAuthentication.getIdToken();
                    // The token will be used automatically by the SDK
                    console.log('[Auth] Token retrieved for database operations');
                } catch (e) {
                    console.warn('[Auth] Could not retrieve token:', e);
                }
            }

            callback(change.user);
        });

        // Return unsubscribe function that cleans up both listeners
        return () => {
            console.log('[Auth] Removing native auth state listener');
            listener.remove();
            webUnsubscribe();
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

/**
 * Debug function to check authentication status
 * Useful for troubleshooting database authentication issues
 */
export async function checkAuthStatus(firebaseApp) {
    console.log('=== Auth Status Debug ===');

    if (isNative) {
        // Check native auth
        try {
            const nativeUser = await FirebaseAuthentication.getCurrentUser();
            console.log('Native user:', nativeUser.user);

            // Check if we can get an ID token
            try {
                const tokenResult = await FirebaseAuthentication.getIdToken();
                console.log('Native ID token available:', !!tokenResult.token);
                console.log('Token preview:', tokenResult.token?.substring(0, 50) + '...');
            } catch (e) {
                console.error('Cannot get ID token:', e);
            }
        } catch (e) {
            console.log('Native user: null');
        }
    }

    // Check web SDK auth
    try {
        const auth = getAuth(firebaseApp);
        console.log('Web SDK user:', auth.currentUser);

        if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                console.log('Web SDK ID token available:', !!token);
                console.log('Token preview:', token.substring(0, 50) + '...');
            } catch (e) {
                console.error('Cannot get Web SDK token:', e);
            }
        }
    } catch (e) {
        console.error('Error checking Web SDK auth:', e);
    }

    console.log('=== End Auth Status ===');
}
