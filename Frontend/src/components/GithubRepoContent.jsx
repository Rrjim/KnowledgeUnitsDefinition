import React, {useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import FileCmp from "./FileCmp";
import ErrorDiv from "../reusable/ErrorDiv";
import useGithubRepoContent from "../hooks/useGithubRepoContent";  // <-- Import the custom hook
import "./../styles/GithubRepoContent.css";

const GithubRepoContent = ({ authStatus, currentUser }) => {
  const { username, repoName, repoId } = useParams();
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");

  // Use custom hook to get files
  const { jsFiles, loading, error } = useGithubRepoContent(username, repoName, repoId, currentUser);

  if (!authStatus.authenticated) {
    navigate(-1);
    return null;
  }

  return (
    <div className="container">
      <h2 className="title">JavaScript Files in {repoName}</h2>
      {error && <ErrorDiv message={error} />}

      {loading ? (
        <div className="loading-container">
          <CircularProgress />
          <p>Loading files...</p>
        </div>
      ) : jsFiles.length > 0 ? (
        <div className="file-list">
          {jsFiles.map((file) => (
            <FileCmp
              key={file.download_url}
              authStatus={authStatus}
              currentUser={currentUser}
              file={file}
              setFileName={setFileName}
              addedFile={Boolean(file.id)}
            />
          ))}
        </div>
      ) : (
        <p className="no-files">No JavaScript files found.</p>
      )}
    </div>
  );
};

export default GithubRepoContent;
