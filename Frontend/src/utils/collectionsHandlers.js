import axios from "axios";
import { labelMap } from "../datasets/labels"; // used in prediction mapping

// --- Fetchers ---

export const fetchCandidates = async () => {
  const { data } = await axios.get("http://localhost:3000/api/user-candidates", {
    withCredentials: true,
  });
  return data;
};

export const fetchCollections = async (username) => {
  const { data } = await axios.get("http://localhost:3000/api/collections", {
    params: { username },
    withCredentials: true,
  });
  return data;
};

export const fetchFiles = async (collectionId) => {
  const { data } = await axios.get("http://localhost:3000/api/collection-files", {
    params: { collectionId },
    withCredentials: true,
  });
  return data;
};

// --- Actions ---

export const deleteFileFromCollection = async (collectionId, fileId) => {
  await axios.post(
    "http://localhost:3000/api/collection-files/delete",
    { collectionId, fileId },
    { withCredentials: true }
  );
};

export const predictFileLabels = async (downloadUrl) => {
  try {
    // Fetch the JavaScript code from the URL
    const { data: jsCode } = await axios.get(downloadUrl);

    const cleanedCode = jsCode
      .split("\n") 
      .filter(line => line.trim() !== "") 
      .join("\n"); 

    const { data: result } = await axios.post("http://localhost:5000/predict", {
      code: cleanedCode, 
    });

    return result; 
  } catch (error) {
    console.error("Error predicting labels:", error);
    throw error; 
  }
};

export const updateFileLabels = async (fileId, labels) => {
  await axios.put(
    `http://localhost:3000/api/files/${fileId}/labels`,
    { labels },
    { withCredentials: true }
  );
};

export const updateCollectionScore = async (collectionId, score) => {
  await axios.put(
    `http://localhost:3000/api/collections/${collectionId}/score`,
    { score },
    { withCredentials: true }
  );
};

// --- Local Aggregations ---

export const aggregateLabels = (files) => {
  const labelsAccumulator = {};

  files.forEach((file) => {
    if (file.labels) {
      Object.entries(file.labels).forEach(([label, confidence]) => {
        if (!labelsAccumulator[label]) {
          labelsAccumulator[label] = [];
        }
        labelsAccumulator[label].push(confidence);
      });
    }
  });

  const averagedLabels = {};
  Object.entries(labelsAccumulator).forEach(([label, confidences]) => {
    const avg = (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2);
    averagedLabels[label] = avg;
  });

  return averagedLabels;
};

// --- Flows ---

export const deleteFileAndUpdate = async (collectionId, fileId, setFiles) => {
  await deleteFileFromCollection(collectionId, fileId);
  setFiles((prev) => prev.filter((file) => file.id !== fileId));
};

export const predictAndUpdateLabels = async (
  downloadUrl,
  fileId,
  selectedCollection,
  setFiles,
  onPredictionDone // Add callback as a parameter
) => {
  const result = await predictFileLabels(downloadUrl);

  const labelsObject = result.predictions.reduce((acc, cur) => {
    const readableLabel = labelMap[cur.label];
    if (readableLabel) {
      acc[readableLabel] = +(cur.confidence * 100).toFixed(2);
    }
    return acc;
  }, {});

  await updateFileLabels(fileId, labelsObject);

  const updatedFiles = await fetchFiles(selectedCollection);
  setFiles(updatedFiles);

  // Trigger the callback with the prediction result
  if (onPredictionDone) {
    onPredictionDone(result.predictions);
  }
};


export const aggregateLabelsAndUpdateScore = async (files, selectedCollection, setCurrentScore, setAggregatedLabels, setLabelDialogOpen) => {
  const averagedLabels = aggregateLabels(files);
  const LABEL_COUNT = 31;
  const uniqueLabelCount = Object.keys(averagedLabels).length;
  const score = ((uniqueLabelCount / LABEL_COUNT) * 100).toFixed(2);

  await updateCollectionScore(selectedCollection, score);

  setCurrentScore(`${score}`);
  setAggregatedLabels(averagedLabels);
  setLabelDialogOpen(true);
};
