import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const CollectionSelectors = ({
  candidateOptions = [],
  collectionOptions = [],
  selectedCandidate = "",
  selectedCollection = "",
  onCandidateChange,
  onCollectionChange,
}) => {
  return (
    <>
      <FormControl fullWidth margin="normal">
        <InputLabel>Select Candidate</InputLabel>
        <Select
          value={selectedCandidate}
          label="Select Candidate"
          onChange={(e) => onCandidateChange?.(e.target.value)}
        >
          {candidateOptions.map((option, index) => (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {collectionOptions.length > 0 && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Collection</InputLabel>
          <Select
            value={selectedCollection}
            label="Select Collection"
            onChange={(e) => onCollectionChange?.(e.target.value)}
          >
            {collectionOptions.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                {col.collection_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
};

export default CollectionSelectors;
