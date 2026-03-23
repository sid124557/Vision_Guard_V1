const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export function hasFirebaseConfig() {
  return !Object.values(firebaseConfig).some((value) => String(value).startsWith("YOUR_"));
}

export async function logDetection(event) {
  if (!hasFirebaseConfig()) {
    return { mode: "mock", event };
  }

  // TODO: Replace with Firebase SDK writes for Firestore + Storage.
  return { mode: "firebase", event };
}

export async function saveDatasetEntries(entries) {
  if (!hasFirebaseConfig()) {
    return { mode: "mock", count: entries.length };
  }

  // TODO: Replace with Firebase Storage uploads and Firestore document writes.
  return { mode: "firebase", count: entries.length };
}

export { firebaseConfig };
