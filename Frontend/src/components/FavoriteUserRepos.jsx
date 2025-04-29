import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";  
import { Delete as DeleteForeverTwoToneIcon , Code as CodeIcon, StarRate as StarRateIcon } from "@mui/icons-material";
import ResultCard from "../reusable/ResultCard";
import UserCard from "../reusable/UserCard";
import useFavoriteUserRepos from "../hooks/useFavoriteUserRepos"; // Import the custom hook
import axios from "axios";
import "./../styles/FavoriteUserRepos.css";

const FavoriteUserRepos = ({ authStatus, currentUser }) => {
  const [currentOwner, setCurrentOwner] = useState(null);
  const { user } = useParams(); // Get username from the route
  const navigate = useNavigate();

  // Use the custom hook
  const { likedRepos, setLikedRepos, uniqueUsers, loading, error, fetchLikedRepos } = useFavoriteUserRepos(currentUser);

  // Check for authentication and redirect if necessary
  useEffect(() => {
    if (!authStatus.authenticated || !currentUser) {
      navigate("/portal");
      return;
    }

    const emailUsername = currentUser.email.split("@")[0]; // Extract username from email
    if (user !== emailUsername) {
      navigate(`/my-favorite-repos/${emailUsername}`); // Redirect to correct path if it doesn't match
    } else {
      fetchLikedRepos(); // Call the function only when it's necessary
    }
  }, [authStatus, currentUser, user, navigate, fetchLikedRepos]); // Added fetchLikedRepos as a dependency

  const handleLikeRepo = async (repo) => {
    if (!authStatus.authenticated) return navigate("/portal");
    try {
      const { status } = await axios.post(
        `http://localhost:3000/api/like-repo`,
        { 
          userId: currentUser.id, 
          repoId: repo.id, 
          ownerName: repo.ownerName, 
          repoName: repo.name, 
          repoLanguage: repo.language || "Unknown" 
        },
        { withCredentials: true }
      );

      if (status === 200) {
        // Toggle the liked repo in the list
        setLikedRepos((prev) =>
          prev.some((r) => r.id === repo.id) ? prev.filter((r) => r.id !== repo.id) : [...prev, repo]
        );
      }
    } catch (error) {
      console.error("Error liking/unliking repo:", error);
    }
  };

  const handleClick = (ownerName) => {
    setCurrentOwner((prevOwner) => (prevOwner === ownerName ? null : ownerName)); // Toggle selection
  };

  const handleNavigate = (repoName, repoId) => {
    if (!authStatus.authenticated) return navigate("/login");
    navigate(`/github-search/${currentOwner}/${repoName}/${repoId}`);
  };

  return (
    <div className="container">
      <div className="user-container centered">
        <h1>Select a dev to display their repos</h1>
        <div className="users-grid">
          {[...uniqueUsers].map((owner_name) => (
            <UserCard
              key={owner_name}
              name={owner_name}
              onClick={handleClick}
              isSelected={currentOwner === owner_name} // Pass selection state
            />
          ))}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {(likedRepos.length > 0 && currentOwner) ? (
        <div className="jumbotron centered" style={{ marginTop: "1rem" }}>
          <div className="repositories-list">
            <h3>Liked Repositories</h3>
            <div className="repositories-grid">
              {likedRepos
                .filter((repo) => !currentOwner || repo.owner_name === currentOwner) // Show only selected user's repos
                .map((repo) => (
                  <ResultCard
                    type="Repository"
                    key={repo.id}
                    resultData={repo}
                    formIconButton1={ 
                      <DeleteForeverTwoToneIcon 
                        style={{
                          color: "rgb(214, 214, 214)",
                          opacity: 1,
                        }}
                      />
                    }
                    formIconButton2={<CodeIcon />}
                    symbol={<StarRateIcon style={{ color: "#FFD700", marginBottom: "2px", height: "1rem" }} />}
                    onClick1={() => handleLikeRepo(repo)}
                    onClick2={() => handleNavigate(repo.name, repo.id)}
                  />
                ))}
            </div>
          </div>
        </div>
      ) : (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>No liked repos found.</p>
      )}
    </div>
  );
};

export default FavoriteUserRepos;
