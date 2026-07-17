import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  getDoc,
  query,
  where,
  getDocFromServer
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBj1rv4fvuIGMhRMHt5FuXOdsbTNeJPAp0",
  authDomain: "toan6coha.firebaseapp.com",
  projectId: "toan6coha",
  storageBucket: "toan6coha.firebasestorage.app",
  messagingSenderId: "927202848713",
  appId: "1:927202848713:web:f2bea7e3f31c2594260218"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Operational types for Firestore error handling as required by skill guidelines
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on initial boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase connection notice: The client appears to be offline. This is normal if Firestore is not yet fully provisioned in the console or if you are working in a restricted network.");
    } else {
      console.warn("Firebase connection check:", error);
    }
  }
}
testConnection();
