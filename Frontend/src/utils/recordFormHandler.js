import axios from "axios";
import { createCollectionDTO } from "../dtos/collection.dto";

// Function to handle the form submission
export const handleSubmit = async (
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
  setError // Add setError as a parameter
) => {
  if (!authStatus.authenticated) return navigate("/portal");

  // Validate existing collection
  if (isExistingCollection) {
    const validNames = collections.map((c) => c.collection_name.toLowerCase());
    if (!validNames.includes(name.toLowerCase())) {
      setError("Please select a valid existing collection from the dropdown.");
      return; // Exit if invalid name
    }
  }

  // Create the collection DTO
  const collectionData = createCollectionDTO(
    name,
    candidate,
    lang,
    currentRepo,
    score,
    currentUser,
    fileId
  );

  try {
    const existingCollection = collections.find(
      (c) => c.collection_name === name
    );
    if (existingCollection) {
      const updatePayload = {
        collectionId: existingCollection.id,
        fileId,
        newRepositories: [currentRepo],
      };

      const { data } = await axios.put(
        "http://localhost:3000/api/update-collection",
        updatePayload,
        { withCredentials: true }
      );

      if (data.message === "Collection updated successfully!") {
        onClose(); // Close the dialog upon success
      }
    } else {
      const { data } = await axios.post(
        "http://localhost:3000/api/create-collection",
        collectionData,
        { withCredentials: true }
      );
      onClose(); // Close the dialog upon success
    }
  } catch (error) {
    console.error("Error creating or updating collection:", error.response?.data || error.message);
    setError("Error creating or updating collection."); // Set the error message on failure
  }
};
