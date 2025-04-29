import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserCard from "../reusable/UserCard";
import FileCmp from "./FileCmp";
import useStandaloneFiles from "../hooks/useStandaloneFiles"; // Import the custom hook

const StandaloneFiles = ({ authStatus, currentUser }) => {
  const { user } = useParams();
  const navigate = useNavigate();

  // Use the custom hook to fetch files and manage state
  const {
    addedFiles,
    uniqueUsers,
    currentOwner,
    loading,
    error,
    fetchAddedFiles,
    handleClick,
  } = useStandaloneFiles(currentUser);

  useEffect(() => {
    if (!authStatus.authenticated || !currentUser) {
      navigate("/portal");
      return;
    }

    const emailUsername = currentUser.email.split("@")[0];
    if (user !== emailUsername) {
      navigate(`/my-standalone-files/${emailUsername}`); // Redirect to correct path if it doesn't match
    } else {
      fetchAddedFiles(); // Fetch files when necessary
    }
  }, [authStatus, currentUser, user, navigate, fetchAddedFiles]);

  return (
    <div className="container">
      <div className="user-container centered">
        <h1>Select a dev</h1>
        <div className="users-grid">
          {[...uniqueUsers].map((ownerName) => (
            <UserCard
              key={ownerName}
              name={ownerName}
              onClick={handleClick}
              isSelected={currentOwner === ownerName}
            />
          ))}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {addedFiles.length > 0 && currentOwner ? (
        <div className="jumbotron centered" style={{ marginTop: "1rem" }}>
          <div className="repositories-list">
            <h3>Saved Files</h3>
            <div className="repositories-grid">
              {addedFiles
                .filter((file) => file.repoOwner === currentOwner && file.id)
                .map((file) => (
                  <FileCmp
                    key={file.id}
                    file={file}
                    authStatus={authStatus}
                    currentUser={currentUser}
                    addedFile={Boolean(file.id)}
                    owner={file.repoOwner}
                    repoId={file.repoId}
                    removedFromCollection={true}
                  />
                ))}
            </div>
          </div>
        </div>
      ) : (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>No files available.</p>
      )}
    </div>
  );
};

export default StandaloneFiles;
