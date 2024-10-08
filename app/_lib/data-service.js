import { firestore, storage } from "@/app/_firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

export async function checkUserExistsByEmail(email) {
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("email", "==", email));

  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

export async function checkUserExistsByUsername(username) {
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("username", "==", username));

  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

export async function addSocialAuthUser(userData) {
  const usersRef = collection(firestore, "users");
  try {
    await addDoc(usersRef, userData);
  } catch (error) {
    throw error;
  }
}

export async function getUserByUID(uid) {
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("uid", "==", uid));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, data: userDoc.data() };
  } else {
    return null;
  }
}

export const uploadImage = async (image) => {
  if (!image) return null;

  try {
    const storageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(storageRef);

    return imageUrl;
  } catch (error) {
    throw error;
  }
};

export const uploadFileDoc = async (file) => {
  if (!file) return null;

  try {
    const fileRef = ref(storage, `files/${file.name}`);

    await uploadBytes(fileRef, file);

    const downloadURL = await getDownloadURL(fileRef);
    return { id: file.name, url: downloadURL };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const uploadBase64Image = async (base64String, imageName) => {
  try {
    const [prefix, base64Data] = base64String.split(",");
    const mime = prefix.match(/:(.*?);/)[1];
    const binary = atob(base64Data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(array)], { type: mime });

    const imageRef = ref(storage, `images/${imageName}`);

    const snapshot = await uploadBytes(imageRef, blob);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export const getConversations = async (user) => {
  try {
    const conversationsRef = collection(firestore, "conversations");

    const q = query(conversationsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const saveConversations = async (updatedConversation) => {
  try {
    const conversationsRef = collection(firestore, "conversations");

    const docRef = await addDoc(conversationsRef, updatedConversation);

    return docRef.id;
  } catch (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }
};

export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);

    await deleteObject(fileRef);

    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const deleteFileMetadata = async (docId) => {
  try {
    const fileDocRef = doc(firestore, "files", docId);

    await deleteDoc(fileDocRef);

    console.log("File metadata deleted successfully");
  } catch (error) {
    console.error("Error deleting file metadata:", error);
    throw error;
  }
};

export const saveFileMetadata = async (fileMetadata) => {
  try {
    const filesCollectionRef = collection(firestore, "files");

    const docRef = await addDoc(filesCollectionRef, fileMetadata);

    return docRef.id;
  } catch (error) {
    console.error("Error saving file metadata:", error);
    throw error;
  }
};

export const getUserFile = async (user) => {
  try {
    const messagesRef = collection(firestore, "files");
    const q = query(messagesRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const id = doc.id;

      return { id, data };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user file:", error);
    throw error;
  }
};

export const saveFeedback = async (feed) => {
  try {
    await addDoc(collection(firestore, "feedbacks"), feed);
  } catch (error) {
    throw error;
  }
};

export const getallFeedbacks = async () => {
  try {
    const feedbacksRef = collection(firestore, "feedbacks");
    const querySnapshot = await getDocs(feedbacksRef);
    const feedbacks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(feedbacks);

    return feedbacks;
  } catch (error) {
    throw error;
  }
};

export const getRatings = async () => {
  try {
    const feedbacksRef = collection(firestore, "feedbacks");
    const querySnapshot = await getDocs(feedbacksRef);
    let accumulatedRating = 0;

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.rating) {
        accumulatedRating += data.rating;
      }
    });
    const avgRating = accumulatedRating / querySnapshot.docs.length;

    console.log(avgRating);

    return {
      avgRate: avgRating,
      totalRating: querySnapshot.docs.length,
    };
  } catch (error) {
    console.error("Error calculating total rating:", error);
    return null;
  }
};
