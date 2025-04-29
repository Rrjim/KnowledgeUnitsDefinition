import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import InputDropdown from "../reusable/InputDropdown";
import useCollectionDetails from "../hooks/useCollectionData";

const RecordFormDetails = ({
  isExistingCollection,
  name,
  candidate,
  lang,
}) => {
  // Use the custom hook to fetch repositories and score
  const { repositories, collectionScore, loading, error } = useCollectionDetails(
    name,
    isExistingCollection
  );

  // You can add any additional state here, if needed
  const [localRepositories, setLocalRepositories] = useState(repositories);
  const [localScore, setLocalScore] = useState(collectionScore);

  useEffect(() => {
    setLocalRepositories(repositories);
    setLocalScore(collectionScore);
  }, [repositories, collectionScore]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Display Error Message */}
      {error && <div>{error}</div>}

      {/* Candidate Dropdown */}
      <InputDropdown
        label="Candidate"
        name={candidate}
        options={[{ value: candidate, label: candidate }]}
        width="100%"
        isDisabled={true}
        isSelectOnly={true}
      />

      {/* Programming Language Dropdown */}
      <InputDropdown
        label="Programming Language"
        placeholder="JavaScript"
        options={[{ value: lang, label: lang }]}
        width="100%"
        isDisabled={true}
        isSelectOnly={true}
      />

      {/* Show repositories and score for existing collection */}
      {isExistingCollection && (
        <>
          <InputDropdown
            key={`repositories-${localRepositories.join('-')}`} // Ensures key uniqueness for repositories
            label="Repositories"
            placeholder={
              localRepositories.length > 0
                ? "Click to view related repos"
                : "No repositories available"
            }
            options={localRepositories.map((r) => ({
              value: r.toLowerCase(),
              label: r.toLowerCase(),
            }))}
            width="100%"
            isDisabled={localRepositories.length === 0}
            isSelectOnly={true}
            isListViewOnly={true}
          />

          <InputDropdown
            key={`repo-count-${localRepositories.length}`} // Forces re-render on repository count change
            label="Number of Repositories"
            options={[{ value: localRepositories.length, label: localRepositories.length.toString() }]}
            width="100%"
            isDisabled={true}
            isSelectOnly={true}
          />

          <InputDropdown
            key={`score-${localScore}`} // Forces re-render on score change
            label="Score"
            options={[{ value: localScore, label: localScore.toString() }]}
            width="100%"
            isDisabled={true}
            isSelectOnly={true}
          />
        </>
      )}
    </Box>
  );
};

export default RecordFormDetails;
