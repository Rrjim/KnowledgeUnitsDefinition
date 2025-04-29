import React from "react";
import useSearchBar from "../hooks/useSearchBar"; // Import the custom hook

const SearchBar = ({ initialUsername, setRepositories, setLoading, setError, authStatus }) => {
  // Use the custom hook for handling search logic
  const { githubUsername, setGithubUsername, handleSearch } = useSearchBar(
    initialUsername, 
    setRepositories, 
    setLoading, 
    setError, 
    authStatus
  );

  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        name="githubUser"
        type="text"
        value={githubUsername}
        onChange={(e) => setGithubUsername(e.target.value)}
        placeholder="Enter GitHub username"
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
