import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ContentPasteSearch as ContentPasteSearchIcon, AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon, DeleteForeverTwoTone } from "@mui/icons-material";
import OfflineBoltTwoToneIcon from '@mui/icons-material/OfflineBoltTwoTone';
import CheckCircleOutlineTwoToneIcon from '@mui/icons-material/CheckCircleOutlineTwoTone';
import ResultCard from "../reusable/ResultCard";
import ConfirmDialog from "../reusable/ConfirmDialog";
import CodeDialog from "../reusable/CodeDialog";
import RecordForm from "./RecordForm";

import { fetchCollections, addFile, loadFileContent } from "../utils/fileHandler";

const FileCmp = ({
  file, authStatus, currentUser, setFileName, addedFile,
  handleFileDelete, handleIntegration, owner, repo,
  removedFromCollection, inCollection, isPredicted
}) => {
  const [collections, setCollections] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [currentAdded, setCurrentAdded] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [localFileName, setLocalFileName] = useState("");
  const [generatedFileId, setGeneratedFileId] = useState(null);

  const navigate = useNavigate();
  const { username, repoName } = useParams();

  const handleConfirmOpen = (name) => {
    setFileName(name);
    setOpenConfirm(true);
  };

  const handleConfirmYes = () => {
    setOpenConfirm(false);
    setOpenForm(true);
  };

  const handleFileAdd = async () => {
    if (!authStatus.authenticated) return navigate("/portal");

    try {
      const { data, fileId } = await addFile({ file, username, owner, repoName, repo, currentUser });
      setGeneratedFileId(fileId);

      if (data.message === "File added successfully!") {
        setCurrentAdded(true);
        const collections = await fetchCollections(username);
        setCollections(collections);
        handleConfirmOpen(file.name);
      } else if (data.message === "File removed successfully!") {
        setCurrentAdded(false);
        removedFromCollection ? setRemoved(true) : setRemoved(false);
      }
    } catch (error) {
      console.error("Error adding file:", error.response?.data || error.message);
    }
  };

  const handleFileClick = async () => {
    try {
      const content = await loadFileContent(file.download_url);
      setFileContent(content);
      setLocalFileName(file.name);
      setOpenCodeDialog(true);
    } catch (error) {
      setError("Error loading file content.");
    }
  };

  const icon = removedFromCollection
    ? <DeleteForeverTwoTone color="grey" />
    : currentAdded !== null
      ? (currentAdded ? <RemoveCircleIcon color="error" /> : <AddCircleIcon color="primary" />)
      : (addedFile ? <RemoveCircleIcon color="error" /> : <AddCircleIcon color="primary" />);

  return (
    !removed && (
      <>
        <ResultCard
          type="File"
          key={file.download_url}
          resultData={{ name: file.name }}
          formIconButton1={icon}
          formIconButton2={<ContentPasteSearchIcon />}
          isPredicted={isPredicted}
          fireIntegrationIcon={inCollection && (isPredicted ? <CheckCircleOutlineTwoToneIcon /> : <OfflineBoltTwoToneIcon />)}
          onClick1={inCollection ? handleFileDelete : handleFileAdd}
          onClick2={handleFileClick}
          onClickIntegration={handleIntegration}
        />

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={handleConfirmYes}
          title="Add File to Collection?"
          message={`This file is added as a standalone file. Would you like to add ${file.name} to one of your collections?`}
        />

        <RecordForm
          fileId={generatedFileId}
          authStatus={authStatus}
          currentUser={currentUser}
          open={openForm}
          onClose={() => setOpenForm(false)}
          candidate={username}
          lang={"JavaScript"}
          currentRepo={repoName}
          score={"0"}
          collections={collections}
        />

        <CodeDialog
          open={openCodeDialog}
          fileName={localFileName}
          fileContent={fileContent}
          onClose={() => setOpenCodeDialog(false)}
        />
      </>
    )
  );
};

export default FileCmp;
