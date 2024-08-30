import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyAAIWwrYPezlFVAYrA0-um4fuGJRhXvVIY",
	authDomain: "yt-downloads-a6c59.firebaseapp.com",
	projectId: "yt-downloads-a6c59",
	storageBucket: "yt-downloads-a6c59.appspot.com",
	messagingSenderId: "936030218475",
	appId: "1:936030218475:web:5aa31f30f1b9d388ff76ae",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
