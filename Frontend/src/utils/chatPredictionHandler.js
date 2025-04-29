import axios from "axios";
export const predictFileLabels = async (code) => {
    try {
      const { data: result } = await axios.post("http://localhost:5000/predict", {
        code: code, 
      });
  
      return result; 
    } catch (error) {
      console.error("Error predicting labels:", error);
      throw error; 
    }
  };
  