import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let dbInstance: Firestore | null = null;

export function getAdminFirestore(): Firestore | null {
  if (dbInstance) return dbInstance;

  try {
    // 1. Check if explicit service account environment variable is provided
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (serviceAccountVar) {
      try {
        const serviceAccount = JSON.parse(serviceAccountVar);
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        if (!getApps().length) {
          initializeApp({
            credential: cert(serviceAccount)
          });
        }
        const app = getApp();
        dbInstance = getFirestore(app);
        return dbInstance;
      } catch (saErr) {
        console.warn('Invalid service account key JSON:', saErr);
      }
    }

    // 2. On Vercel / serverless without explicit service account key, skip ADC to prevent gRPC / metadata timeout
    if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_BUILDER || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      console.warn('Vercel/Serverless environment detected without explicit Service Account Key. Firestore cloud sync disabled for serverless function.');
      return null;
    }

    // 3. Check if ADC credentials or Google Cloud environment exist before initializing without credentials
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.K_SERVICE && !process.env.GCLOUD_PROJECT && !process.env.GAE_APPLICATION) {
      return null;
    }

    // 4. Local container / GCP fallback with config file
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const projectId = config.projectId;
    const databaseId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
      ? config.firestoreDatabaseId
      : '(default)';

    if (!getApps().length) {
      initializeApp({ projectId });
    }

    const app = getApp();
    dbInstance = databaseId !== '(default)' ? getFirestore(app, databaseId) : getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('Failed to initialize Firebase Admin Firestore:', err);
    return null;
  }
}

