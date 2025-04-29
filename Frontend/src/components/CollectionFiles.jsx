import React from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import FileCmp from "./FileCmp";

const CollectionFiles = ({
  files,
  handleShowAllLabels,
  handleFileDelete,
  handleIntegration,
  authStatus,
  currentUser,
  loadingPrediction
}) => {
  if (!files || files.length === 0) {
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        There are not any files yet!
      </p>
    );
  }

  return (
    <Box mt={4} position="relative">
  {loadingPrediction && (
    <Box
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      bgcolor="rgba(255,255,255,0.7)"
      display="flex"
      justifyContent="center"
      alignItems="center"
      zIndex={10}
    >
      <CircularProgress />
    </Box>
  )}
      <Button
        variant="contained"
        onClick={handleShowAllLabels}
        disabled={files.length === 0}
        sx={{
          mt: 2,
          backgroundColor: "#673ab7", // deep purple
          color: "#fff",
          "&:hover": {
            backgroundColor: "#5e35b1",
          },
        }}
      >
        Evaluate
      </Button>

      <Typography variant="h6" mt={2}>
        Files in Collection:
      </Typography>

      <div className="repositories-list">
        <div className="repositories-grid">
          {files.map((file) => (
            <FileCmp
              key={file.id}
              file={file}
              authStatus={authStatus}
              currentUser={currentUser}
              addedFile={Boolean(file.id)}
              owner={file.owner}
              repoId={file.repo_id}
              removedFromCollection={true}
              repo={file.repo_name}
              inCollection={true}
              handleFileDelete={() => handleFileDelete(file.id)}
              handleIntegration={() => handleIntegration(file.download_url, file.id)}
              isPredicted={file.labels !== null}
            />
          ))}
        </div>
      </div>
    </Box>
  );
};

export default CollectionFiles;
