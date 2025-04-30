import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useFavoriteUserRepos = (currentUser) => {
  const [likedRepos, setLikedRepos] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLikedRepos = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(`http://localhost:3000/api/liked-repos`, {
        params: { userId: currentUser.id },
        withCredentials: true,
      });

      const users = new Set();
      setLikedRepos(data.likedRepos || []);
      data.likedRepos.forEach((repo) => {
        users.add(repo.owner_name);
      });
      setUniqueUsers(users);
    } catch (err) {
      setError("Error fetching liked repositories.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch the liked repositories when currentUser changes
  useEffect(() => {
    fetchLikedRepos();
  }, [currentUser]); // fetchLikedRepos removed

  return {
    likedRepos,
    setLikedRepos,
    uniqueUsers,
    loading,
    error,
    fetchLikedRepos,
  };
};

export default useFavoriteUserRepos;
