// src/components/CollectionDialogs.jsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";
import { labelMap } from "../datasets/labels"; // you still need labelMap!

const CollectionDialogs = ({
  dialogOpen,
  setDialogOpen,
  predictionResult,
  labelDialogOpen,
  setLabelDialogOpen,
  aggregatedLabels,
  currentScore
}) => {
  return (
    <>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Prediction Results</DialogTitle>
        <DialogContent dividers>
          {predictionResult && predictionResult.length > 0 ? (
            predictionResult.map((p, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {labelMap[p.label]}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Confidence: {(p.confidence * 100).toFixed(2)}%
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No predictions available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Aggregated Labels Modal */}
      <Dialog open={labelDialogOpen} onClose={() => setLabelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: "1.75rem",
            background: "linear-gradient(90deg,rgb(114, 0, 146),rgb(101, 0, 163))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            letterSpacing: 1,
            mb: 2,
          }}
        >
          Aggregated Labels in Collection
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(90deg,rgb(105, 0, 180),rgb(99, 0, 132))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
              textAlign: "center",
              letterSpacing: 1,
              fontSize: "1.25rem",
            }}
          >
            Knowledge Units Covered: {currentScore}%
          </Typography>
          {Object.keys(aggregatedLabels).length > 0 ? (
            Object.entries(aggregatedLabels).map(([label, avgConfidence]) => (
              <Box key={label} mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {label}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Average Confidence: {avgConfidence}%
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No labels found in this collection.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabelDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CollectionDialogs;
