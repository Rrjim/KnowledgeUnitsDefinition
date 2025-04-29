import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useRepoFiles = (username, repoName, repoId, currentUser) => {
  const [jsFiles, setJsFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoized version of fetchRepoFiles
  const fetchRepoFiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:3000/api/repo-js-code/${username}/${repoName}/content`,
        { withCredentials: true }
      );
      const data = response.data;

      if (data.length === 0) {
        throw new Error("No JavaScript files found.");
      }

      setJsFiles(data);
      return data;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [username, repoName]);

  // Memoized version of fetchAddedFiles
  const fetchAddedFiles = useCallback(async (repoFiles) => {
    try {
      const { data, status } = await axios.get(
        "http://localhost:3000/api/added-files",
        {
          params: {
            userId: currentUser.id,
            repoId: repoId,
          },
          withCredentials: true,
        }
      );

      if (status === 200) {
        const updatedFiles = repoFiles.map(file => {
          const match = data.files.find(f => f.download_url === file.download_url);
          if (match) {
            return { ...file, id: match.id };
          }
          return file;
        });
        setJsFiles(updatedFiles);
      }
    } catch (err) {
      console.error("Error fetching added files:", err);
    }
  }, [currentUser, repoId]);

  const loadFiles = useCallback(async () => {
    // Only call fetchAddedFiles if repoFiles are successfully fetched
    const repoFiles = await fetchRepoFiles();
    if (repoFiles && repoFiles.length > 0) {
      await fetchAddedFiles(repoFiles);
    }
  }, [fetchRepoFiles, fetchAddedFiles]);

  // Only re-run when either repoName or repoId changes
  useEffect(() => {
    loadFiles();
  }, [repoName, repoId, loadFiles]);

  return { jsFiles, loading, error };
};

export default useRepoFiles;
