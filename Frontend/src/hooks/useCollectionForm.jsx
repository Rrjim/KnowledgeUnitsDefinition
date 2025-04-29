import { useEffect, useState } from "react";
import { fetchCandidates, fetchCollections, fetchFiles, deleteFileAndUpdate, predictAndUpdateLabels, aggregateLabelsAndUpdateScore } from "../utils/collectionsHandlers";

export const useCollectionForm = (initialSelectedCandidate, initialSelectedCollection) => {
  const [candidates, setCandidates] = useState([]);
  const [collections, setCollections] = useState([]);
  const [files, setFiles] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [aggregatedLabels, setAggregatedLabels] = useState({});
  const [currentScore, setCurrentScore] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(initialSelectedCandidate);
  const [selectedCollection, setSelectedCollection] = useState(initialSelectedCollection);
  const [loadingPrediction, setLoadingPrediction] = useState(false); 

  // Fetch candidates
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const data = await fetchCandidates();
        setCandidates(data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };

    loadCandidates();
  }, []);

  // Fetch collections when a candidate is selected
  useEffect(() => {
    if (!selectedCandidate) return;

    const loadCollections = async () => {
      try {
        const data = await fetchCollections(selectedCandidate);
        setCollections(data);
        setSelectedCollection(""); // Reset collection when a new candidate is selected
        setFiles([]); // Clear files
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    loadCollections();
  }, [selectedCandidate]);

  // Fetch files when a collection is selected
  useEffect(() => {
    if (!selectedCollection) return;

    const loadFiles = async () => {
      try {
        const data = await fetchFiles(selectedCollection);
        setFiles(data);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    loadFiles();
  }, [selectedCollection]);

  const handleFileDelete = (fileId) => {
    deleteFileAndUpdate(selectedCollection, fileId, setFiles);
  };

  const handleIntegration = async (downloadUrl, fileId) => {
    setLoadingPrediction(true); // Show spinner
  
    try {
      await predictAndUpdateLabels(
        downloadUrl,
        fileId,
        selectedCollection,
        setFiles,
        (predictions) => {
          setPredictionResult(predictions); // set prediction result
          setDialogOpen(true);               // open dialog after prediction
        }
      );
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoadingPrediction(false); // Hide spinner once done
    }
  };  


  const handleShowAllLabels = () => {
    aggregateLabelsAndUpdateScore(files, selectedCollection, setCurrentScore, setAggregatedLabels, setLabelDialogOpen);
  };

  return {
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
    setSelectedCandidate, 
    setSelectedCollection, 
    handleFileDelete,
    handleIntegration,
    handleShowAllLabels,
    setDialogOpen,
    setLabelDialogOpen,
  };
};
