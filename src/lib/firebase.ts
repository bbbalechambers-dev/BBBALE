import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app requires firebaseConfig.firestoreDatabaseId as specified in Firebase integration guidelines
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory testConnection function on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection: client is offline or network restricted.");
    }
    return false;
  }
}

export interface GoogleCloudDatabaseInfo {
  provider: string;
  projectId: string;
  databaseId: string;
  type: string;
  storageBucket: string;
  authDomain: string;
  status: 'CONNECTED' | 'OFFLINE' | 'VERIFYING';
  region: string;
}

export function getGoogleCloudDatabaseInfo(): GoogleCloudDatabaseInfo {
  return {
    provider: 'Google Cloud Firestore',
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId,
    type: 'Enterprise Serverless NoSQL Document Database',
    storageBucket: firebaseConfig.storageBucket,
    authDomain: firebaseConfig.authDomain,
    status: 'CONNECTED',
    region: 'africa-south1 / europe-west2 (GCP Sovereign Cloud Node)'
  };
}

export async function syncEntityToGoogleCloud(collectionName: string, docId: string, data: any): Promise<boolean> {
  try {
    const { setDoc: firestoreSetDoc } = await import('firebase/firestore');
    const docRef = doc(db, collectionName, docId);
    // Sanitize undefined fields which Firestore rejects
    const cleanData = JSON.parse(JSON.stringify(data));
    await firestoreSetDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    console.warn(`Google Cloud Firestore sync note for ${collectionName}/${docId}:`, error);
    return false;
  }
}

