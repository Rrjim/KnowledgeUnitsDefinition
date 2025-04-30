import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Custom hook to fetch liked repositories
const useLikedRepos = (currentUser) => {
  const [likedRepos, setLikedRepos] = useState(new Set());
  const [error, setError] = useState("");

  const fetchLikedRepos = useCallback(async () => {
    if (!currentUser) return; // Skip if currentUser is not available

    try {
      const { data, status } = await axios.get(`http://localhost:3000/api/liked-repos`, {
        params: { userId: currentUser.id },
        withCredentials: true,
      });

      if (status === 200) {
        const likedRepoIds = new Set(data.likedRepos.map((repo) => repo.id));
        setLikedRepos(likedRepoIds);
      }
    } catch (err) {
      console.error("Error fetching liked repositories:", err);
      setError("Failed to load liked repositories.");
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLikedRepos();
  }, [currentUser]); //fetchLikedRepos removed

  return { likedRepos, error }; // fetchLikedRepos removed
};

export default useLikedRepos;
