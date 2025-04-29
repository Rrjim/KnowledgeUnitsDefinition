import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GitHub as GitHubIcon, StarRate as StarRateIcon, ThumbUp as ThumbUpOffAltTwoToneIcon, Code as CodeIcon } from "@mui/icons-material";
import ResultCard from "../reusable/ResultCard";
import SearchBar from "./SearchBar"; 
import { capitalizeFirstLetter } from "../transformers/UsernameTransformer";
import "./../styles/GithubSearch.css";
import { deepPurple } from "@mui/material/colors";
import useLikedRepos from "../hooks/useLikedRepos"; // Import the custom hook
import axios from "axios";

const GithubSearch = ({ authStatus, currentUser }) => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { username } = useParams();
  const navigate = useNavigate();

  // Use the custom hook to fetch liked repositories
  const { likedRepos, error: likedReposError, fetchLikedRepos } = useLikedRepos(currentUser);

  const handleLikeRepo = async (repo) => {
    if (!authStatus.authenticated) return navigate("/portal");
    console.log(repo);
    try {
      const { status } = await axios.post(
        `http://localhost:3000/api/like-repo`,
        { userId: currentUser.id, repoId: repo.id, ownerName: capitalizeFirstLetter(repo.ownerName), repoName: repo.name, repoLanguage: repo.language || "Unknown" },
        { withCredentials: true }
      );

      if (status === 200) {
        fetchLikedRepos(); // Refresh liked repos after liking/unliking
      }
    } catch (error) {
      console.error("Error liking/unliking repo:", error);
    }
  };

  const handleNavigate = (repoName, repoId) => {
    if (!authStatus.authenticated) return navigate("/portal");
    navigate(`/github-search/${username}/${repoName}/${repoId}`);
  };

  return (
    <div className="container">
      <div className="jumbotron centered">
        <GitHubIcon style={{ fontSize: "100px", color: "#333" }} />
        <h1>GitHub Repo Viewer</h1>
        <p>Search for a GitHub user’s repositories and view JavaScript files</p>

        <SearchBar
          initialUsername={username} 
          setRepositories={setRepositories}
          setLoading={setLoading}
          setError={setError}
          authStatus={authStatus}
        />

        {error && <p className="error">{error}</p>}
        {likedReposError && <p className="error">{likedReposError}</p>}
      </div>

      {repositories.length > 0 && (
        <div className="jumbotron centered" style={{ marginTop: "1rem" }}>
          <div className="repositories-list">
            <h3 style={{color: deepPurple[500]}}>Repositories</h3>
            <div className="repositories-grid">
              {repositories.map((repo) => (
                <ResultCard
                  type="Repository"
                  key={repo.id}
                  resultData={repo}
                  formIconButton1={
                    <ThumbUpOffAltTwoToneIcon
                      style={{ color: likedRepos.has(repo.id) ? "" : "rgb(132, 132, 132)", opacity: likedRepos.has(repo.id) ? 1 : 0.6 }}
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
      )}
    </div>
  );
};

export default GithubSearch;
