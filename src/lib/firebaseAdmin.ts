import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fallbackConfig from '../../firebase-applet-config.json';

let dbInstance: Firestore | null = null;

function parseServiceAccount(val?: string): any {
  if (!val) return null;
  const trimmed = val.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e1) {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (e2) {
      return null;
    }
  }
}

export function getAdminFirestore(): Firestore | null {
  if (dbInstance) return dbInstance;

  try {
    const databaseId = 
      process.env.FIREBASE_DATABASE_ID || 
      process.env.VITE_FIREBASE_DATABASE_ID || 
      fallbackConfig.firestoreDatabaseId;

    const projectId = 
      process.env.FIREBASE_PROJECT_ID || 
      process.env.VITE_FIREBASE_PROJECT_ID || 
      fallbackConfig.projectId;

    // 1. Check if explicit service account environment variable is provided
    const serviceAccountVar = 
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (serviceAccountVar) {
      const serviceAccount = parseServiceAccount(serviceAccountVar);
      if (serviceAccount) {
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        if (!getApps().length) {
          initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || projectId
          });
        }
        const app = getApp();
        dbInstance = databaseId && databaseId !== '(default)' 
          ? getFirestore(app, databaseId) 
          : getFirestore(app);
        return dbInstance;
      }
    }

    // 2. Check if running in GCP Cloud environment with Google Application Default Credentials (ADC)
    const isGcpEnvironment = Boolean(
      process.env.K_SERVICE || 
      process.env.GAE_APPLICATION || 
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    );

    if (!isGcpEnvironment) {
      // Running in Vercel or local environment without Service Account key - skip ADC metadata probe to avoid timeouts
      return null;
    }

    // 3. GCP environment fallback
    if (!getApps().length) {
      initializeApp({ projectId });
    }

    const app = getApp();
    dbInstance = databaseId && databaseId !== '(default)' 
      ? getFirestore(app, databaseId) 
      : getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('Firebase Admin Firestore initialization notice:', err);
    return null;
  }
}


