import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where } from "firebase/firestore";
import {  addDoc } from "firebase/firestore"; 
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject  } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { doc, setDoc, updateDoc, getDocs} from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

//personal one
const firebaseConfig = {
  apiKey: "AIzaSyA8dPqNvcV4CsWLlk5H1eb08mMONKLvLs8",
  authDomain: "rice-farming-fb3dc.firebaseapp.com",
  projectId: "rice-farming-fb3dc",
  storageBucket: "rice-farming-fb3dc.firebasestorage.app",
  messagingSenderId: "756172680721",
  appId: "1:756172680721:web:8e30bae29da82b57750bb0"
};



const app = initializeApp(firebaseConfig);
const storage = getStorage();

console.log("Firebase initialized with config:", app);

export const db = getFirestore(app);


export async function loadRice() {
  const snapshot = await getDocs(collection(db, "rice-grains"));
  
  const occupied = new Set();
  const riceList = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const key = `${data.row}-${data.col}`;
    
    occupied.add(key);
    riceList.push(data);
  });

  return { occupied, riceList };
}

export async function addGrain(rice) {
  try {
    const docRef = doc(db, "rice-grains", `${rice.row}-${rice.col}`);
    await setDoc(docRef, rice);
    console.log("✅ rice added", rice);
  } catch (err) {
    console.error("❌ error adding rice:", err);
  }
}

export async function checkEmail(email) {
  const q = query(
    collection(db, "rice-grains"),
    where("email", "==", email)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty; 
  // true = email already exists
}





/* export async function blobToMeshyModel(blob, text, generatedId) {
  const docRef = doc(db, "ar-uploads", generatedId);

  const tempRef = ref(storage, `temp/${generatedId}/source.png`);
  await uploadBytes(tempRef, blob, { contentType: 'image/png' });
  const imageUrl = await getDownloadURL(tempRef);

  const apiRes = await fetch('http://localhost:3000/generate-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, imageUrl, generatedId })
  });

  const { pngResults, glbBuffer } = await apiRes.json();

  const uploadPromises = Object.values(pngResults).map(async (base64, index) => {
    const imgRes = await fetch(`data:image/png;base64,${base64}`);
    const imgBlob = await imgRes.blob();
    const imageRef = ref(storage, `ar-uploads/${generatedId}/generatedPNG/img_${index + 1}.png`);
    await uploadBytes(imageRef, imgBlob, { contentType: 'image/png' });
    return getDownloadURL(imageRef);
  });

  // upload PNGs and GLB at the same time
  const [generatedImageUrls, model3DUrl] = await Promise.all([
    Promise.all(uploadPromises),
    (async () => {
      const glbBlob = await fetch(`data:model/gltf-binary;base64,${glbBuffer}`).then(r => r.blob());
      const modelRef = ref(storage, `ar-uploads/${generatedId}/3D-model/model.glb`);
      await uploadBytes(modelRef, glbBlob, { contentType: 'model/gltf-binary' });
      return getDownloadURL(modelRef);
    })()
  ]);

  await setDoc(docRef, {
    modelUrl: model3DUrl,
    generatedImageUrls,
    createdAt: new Date()
  });

  await deleteObject(tempRef);

  return { generatedId, generatedImageUrls, modelUrl: model3DUrl };
}
 */


export async function blobToMeshyModel(blob, text, generatedId) {
  const docRef = doc(db, "ar-uploads", generatedId);

  const tempRef = ref(storage, `temp/${generatedId}/source.png`);
  await uploadBytes(tempRef, blob, { contentType: 'image/png' });
  const imageUrl = await getDownloadURL(tempRef);

  // start job — comes back fast now
  const { pngResults, taskId } = await fetch('http://localhost:3000/generate-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, imageUrl, generatedId })
  }).then(r => r.json());

  // upload PNGs immediately
  const uploadPromises = Object.values(pngResults).map(async (base64, index) => {
    const imgBlob = await fetch(`data:image/png;base64,${base64}`).then(r => r.blob());
    const imageRef = ref(storage, `ar-uploads/${generatedId}/generatedPNG/img_${index + 1}.png`);
    await uploadBytes(imageRef, imgBlob, { contentType: 'image/png' });
    return getDownloadURL(imageRef);
  });

  const generatedImageUrls = await Promise.all(uploadPromises);

  await setDoc(docRef, {
    generatedImageUrls,
    status: 'processing', // 3D model not ready yet
    createdAt: new Date()
  });

  await deleteObject(tempRef);

  // listen for when 3D model is ready
  return new Promise((resolve) => {
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.data()?.status === 'done') {
        unsub();
        resolve(snap.data());
      }
    });
  });
}