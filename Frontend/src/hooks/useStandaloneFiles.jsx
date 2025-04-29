import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useStandaloneFiles = (currentUser) => {
  const [addedFiles, setAddedFiles] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState(new Set());
  const [currentOwner, setCurrentOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAddedFiles = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:3000/api/user-files", {
        params: { userId: currentUser.id },
        withCredentials: true,
      });

      const fetchedFiles = response.data.files || [];
      console.log("Fetched Files from Server:", fetchedFiles);

      if (fetchedFiles.length === 0) {
        setError("No files found.");
      } else {
        const usersSet = new Set(fetchedFiles.map((file) => file.repoOwner));
        console.log("Unique Users Set:", usersSet);
        setAddedFiles(fetchedFiles);
        setUniqueUsers(usersSet);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Error fetching added files.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Refetch files when currentOwner changes
  useEffect(() => {
    if (currentOwner) {
      fetchAddedFiles();
    }
  }, [currentOwner, fetchAddedFiles]);

  const handleClick = (ownerName) => {
    setCurrentOwner((prevOwner) => (prevOwner === ownerName ? null : ownerName));
  };

  return {
    addedFiles,
    uniqueUsers,
    currentOwner,
    loading,
    error,
    fetchAddedFiles,
    handleClick,
  };
};

export default useStandaloneFiles;
