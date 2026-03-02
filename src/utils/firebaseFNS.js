import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase"; // Import your initialized db
import { collection, addDoc, getDocs } from "firebase/firestore";

export const addCamp = async (data) => {
  try {
    // Reference to the 'tasks' collection
    const docRef = await addDoc(collection(db, "Campaigns"), {
      ...data,
      createdAt: new Date(),
    });
    console.log("Document added with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const fetchCamps = async () => {
  const querySnapshot = await getDocs(collection(db, "Campaigns"));
  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return data;
};

export const addProd = async (data) => {
  try {
    // Reference to the 'tasks' collection
    const docRef = await addDoc(collection(db, "Products"), {
      ...data,
      createdAt: new Date(),
    });
    console.log("Document added with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const fetchProds = async () => {
  const querySnapshot = await getDocs(collection(db, "Products"));
  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return data;
};

export const uploadToStorage = async (blob, folder = "uploads") => {
  try {
    // 1. Create a unique filename (e.g., "uploads/1715632000.png")
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // 2. Upload the blob
    const snapshot = await uploadBytes(storageRef, blob);

    // 3. Get and return the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
