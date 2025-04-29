import React from "react";
import { Box, Typography } from "@mui/material";
import CollectionSelectors from "./CollectionSelectors";
import CollectionFiles from "./CollectionFiles";
import CollectionDialogs from "./CollectionDialogs";
import { useCollectionForm } from "../hooks/useCollectionForm"; // Import the custom hook

const MyCollection = ({ authStatus, currentUser }) => {
  const {
    candidates,
    collections,
    files,
    predictionResult,
    dialogOpen,
    labelDialogOpen,
    aggregatedLabels,
    currentScore,
    selectedCandidate,
    selectedCollection,
    loadingPrediction,
    setSelectedCandidate, // get the setter for candidate
    setSelectedCollection, // get the setter for collection
    handleFileDelete,
    handleIntegration,
    handleShowAllLabels,
    setDialogOpen,
    setLabelDialogOpen,
  } = useCollectionForm(""); // Use the custom hook with initial state as empty

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        My Collections
      </Typography>

      <CollectionSelectors
        candidateOptions={candidates}
        collectionOptions={collections}
        selectedCandidate={selectedCandidate}
        selectedCollection={selectedCollection}
        onCandidateChange={(candidate) => {
          setSelectedCandidate(candidate);
          setSelectedCollection(""); // Reset collection when candidate changes
        }}
        onCollectionChange={(collectionId) => {
          setSelectedCollection(collectionId);
        }}
      />

      <CollectionFiles
        files={files}
        handleShowAllLabels={handleShowAllLabels}
        handleFileDelete={handleFileDelete}
        handleIntegration={handleIntegration}
        authStatus={authStatus}
        currentUser={currentUser}
        loadingPrediction={loadingPrediction}
      />

      <CollectionDialogs
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        predictionResult={predictionResult}
        labelDialogOpen={labelDialogOpen}
        setLabelDialogOpen={setLabelDialogOpen}
        aggregatedLabels={aggregatedLabels}
        currentScore={currentScore}
      />
    </Box>
  );
};

export default MyCollection;
