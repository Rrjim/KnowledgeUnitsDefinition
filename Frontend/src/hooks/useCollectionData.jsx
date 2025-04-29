import { useState, useEffect } from 'react';
import axios from 'axios';

const useCollectionData = (name, isExistingCollection) => {
  const [repositories, setRepositories] = useState([]);
  const [collectionScore, setCollectionScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCollectionData = async () => {
      if (!name) return; // If name is empty, don't try to fetch

      setLoading(true);
      setError('');
      setRepositories([]); // Reset repositories to clear previous state
      setCollectionScore(0); // Reset collection score

      try {
        if (isExistingCollection) {
          // Fetch repositories and score if an existing collection is selected
          await fetchCollectionRepos(name);
          await fetchCollectionScore(name);
        } else {
          // Handle new collection logic if needed
          setRepositories([]);
          setCollectionScore(0);
        }
      } catch (err) {
        setError('Failed to fetch collection data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [name, isExistingCollection]); // Depend on name and isExistingCollection

  const fetchCollectionRepos = async (name) => {
    try {
      const { data } = await axios.post(
        'http://localhost:3000/api/collection-repos',
        { name },
        { withCredentials: true }
      );

      // Ensure repositories are properly set (empty if no repos are returned)
      setRepositories(data[0]?.repositories || []);
    } catch (error) {
      console.error('Failed to fetch collection repositories:', error);
      setRepositories([]); // Fallback to empty repositories
    }
  };

  const fetchCollectionScore = async (name) => {
    try {
      const { data } = await axios.post(
        'http://localhost:3000/api/collection-score',
        { name },
        { withCredentials: true }
      );
      const scoreValue = data?.score ?? 0;
      setCollectionScore(scoreValue);
    } catch (error) {
      console.error('Failed to fetch collection score:', error);
      setCollectionScore(0);
    }
  };

  return { repositories, collectionScore, loading, error };
};

export default useCollectionData;
