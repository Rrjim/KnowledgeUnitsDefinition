import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { keyframes } from "@mui/system";
import IconBtn from "../reusable/IconBtn";
import InputDropdown from "../reusable/InputDropdown";
import YesNoToggle from "../reusable/Toggle";
import { useNavigate } from "react-router-dom";
import ErrorDiv from "../reusable/ErrorDiv";
import RecordFormDetails from "./RecordFormDetails"; // Import the new component
import { handleSubmit } from "../utils/recordFormHandler"; // Import external handler

const tinySplash = keyframes`0% { transform: scale(1); } 50% { transform: scale(1.01) rotate(0.8deg); }100% { transform: scale(1) rotate(0deg); }`;

const RecordForm = ({
  authStatus,
  currentUser,
  open,
  onClose,
  fileId,
  candidate,
  lang,
  currentRepo,
  score,
  collections,
}) => {
  const [isExistingCollection, setIsExistingCollection] = useState(true);
  const [name, setName] = useState(""); // Store the collection name
  const [error, setError] = useState(""); // Error state
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setError("");
      setName("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <h3 style={{ color: "#552899" }}>Add this file to your collection</h3>
          <IconBtn
            icon={<CloseIcon />}
            avatarColor={"#DC143C"}
            onClick={onClose}
          />
        </Box>
        {error && <ErrorDiv message={error} timeout={60000} />}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <YesNoToggle
            header="Would you like to add this file to an existing collection?"
            checked={isExistingCollection}
            onToggleChange={setIsExistingCollection}
          />

          <Box>
            {isExistingCollection ? (
              <InputDropdown
                label="Existing Collection"
                placeholder="Select existing collection"
                options={collections
                  .filter((c) => c?.collection_name)
                  .map((c) => ({
                    label: c.collection_name,
                    value: c.collection_name,
                  }))} 
                width="100%"
                isDisabled={false}
                onSelect={(value) => setName(value)} // Set the selected name
              />
            ) : (
              <InputDropdown
                label="New Collection Name"
                placeholder="Type new collection name"
                options={[]} // No options for free input
                width="100%"
                isDisabled={false}
                isSelectOnly={false}
                onSelect={(value) => setName(value)}
              />
            )}
          </Box>

          {/* Include the details component here */}
          <RecordFormDetails
            isExistingCollection={isExistingCollection}
            name={name}
            candidate={candidate}
            lang={lang}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() =>
            handleSubmit(
              authStatus,
              navigate,
              isExistingCollection,
              collections,
              name,
              candidate,
              lang,
              currentRepo,
              score,
              currentUser,
              fileId,
              onClose, 
              setError 
            )
          } 
          sx={{
            "&:hover": {
              animation: `${tinySplash} 0.4s ease`,
              backgroundColor: "#6a33b8",
            },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordForm;
