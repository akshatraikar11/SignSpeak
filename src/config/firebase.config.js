import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth helper functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        logEvent(analytics, 'user_signed_in', {
            method: 'google'
        });
        return result.user;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        logEvent(analytics, 'user_signed_out');
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

// Firestore helper functions
export const saveTranslation = async (userId, translationData) => {
    try {
        const docRef = await addDoc(collection(db, 'users', userId, 'translations'), {
            ...translationData,
            timestamp: serverTimestamp()
        });

        logEvent(analytics, 'translation_saved', {
            signs_count: translationData.signs.length
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving translation:', error);
        throw error;
    }
};

export const getUserTranslations = async (userId, limitCount = 10) => {
    try {
        const q = query(
            collection(db, 'users', userId, 'translations'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const translations = [];

        querySnapshot.forEach((doc) => {
            translations.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return translations;
    } catch (error) {
        console.error('Error getting translations:', error);
        return [];
    }
};

// Auth state observer
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};
