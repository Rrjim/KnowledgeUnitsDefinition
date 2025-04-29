// handlers/fileHandler.js

import axios from "axios";
import { generateSimpleHash } from "../transformers/IdGenerator";

// Fetch user's collections
export const fetchCollections = async (username) => {
  const { data } = await axios.get(
    `http://localhost:3000/api/collections?username=${username}`,
    { withCredentials: true }
  );
  return data;
};

// Add or remove a file
export const addFile = async ({ file, username, owner, repoName, repo, currentUser }) => {
  const fileId = await generateSimpleHash(file.download_url);
  const { data } = await axios.post(
    "http://localhost:3000/api/add-file",
    {
      fileId,
      userId: currentUser.id,
      fileName: file.name,
      owner: username || owner,
      repoName: file.repoName || repoName || repo,
      downloadUrl: file.download_url,
    },
    { withCredentials: true }
  );
  return { data, fileId };
};

// Load file content
export const loadFileContent = async (downloadUrl) => {
  const { data } = await axios.get(downloadUrl, { responseType: 'text' });
  return data;
};
