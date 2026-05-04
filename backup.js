import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fs from "fs";

// Parse .env file manually so we don't need to install external packages
const envConfig = Object.fromEntries(
  fs.readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim()];
    })
);

// Using the credentials dynamically from your .env file
const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runBackup() {
  console.log("Starting read-only backup of Firestore data...");
  
  const backup = {
    timestamp: new Date().toISOString(),
    metaState: null,
    sessions: []
  };

  try {
    // 1. Read bdt_db -> metaState
    console.log("Fetching global state (metaState)...");
    const metaRef = await getDoc(doc(db, "bdt_db", "metaState"));
    if (metaRef.exists()) {
      backup.metaState = metaRef.data();
    }

    // 2. Read bdt_sessions
    console.log("Fetching all collected sessions...");
    const sessionsSnapshot = await getDocs(collection(db, "bdt_sessions"));
    sessionsSnapshot.forEach((docNode) => {
      backup.sessions.push({ _id: docNode.id, ...docNode.data() });
    });

    // 3. Write to local file safely
    const timeSafeString = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `firebase-backup-${timeSafeString}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log("\n✅ Backup complete! Your live application was NOT affected.");
    console.log(`💾 Saved to file: ${filename}`);
    console.log(`📊 Statistics: 1 meta document, ${backup.sessions.length} sessions backed up.`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating backup:", error.message);
    process.exit(1);
  }
}

runBackup();