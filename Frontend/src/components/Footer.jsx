import React, { useEffect, useRef, useState } from "react";
import { Box, TextField, IconButton, Collapse, Typography, Paper, Chip, Stack } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { predictFileLabels } from "../utils/chatPredictionHandler";
import { labelMap } from "../datasets/labels";

const Footer = ({ authStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevAuthStatus = useRef(authStatus.authenticated);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      setMessages((prev) => [...prev, { sender: "user", type: "text", text: message }]);
      const code = message.trim();
      setLoading(true);

      try {
        const result = await predictFileLabels(code);
        if (result && result.predictions) {
          const formattedPredictions = result.predictions.map((pred) => ({
            label: labelMap[pred.label] || pred.label,
            confidence: Math.round(pred.confidence * 100),
          }));

          setMessages((prev) => [
            ...prev,
            { sender: "bot", type: "prediction", predictions: formattedPredictions },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", type: "text", text: "⚠️ No predictions returned from the backend." },
          ]);
        }
      } catch (error) {
        console.error("Prediction failed:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", type: "text", text: "❌ Sorry, something went wrong while processing your code." },
        ]);
      } finally {
        setLoading(false);
      }

      setMessage("");
    }
  };

  useEffect(() => {
    if (!prevAuthStatus.current && authStatus.authenticated) {
      setExpanded(false); // start collapsed
    }
    prevAuthStatus.current = authStatus.authenticated;
  }, [authStatus.authenticated]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const toggleChat = () => {
    setExpanded((prev) => !prev);
    if (!expanded && messages.length === 0) {
      setMessages([{ sender: "bot", type: "text", text: "Howdy mate! 👋 How can I help you today?" }]);
    }
    setTimeout(() => {
      if (inputRef.current && !expanded) {
        inputRef.current.focus();
      }
    }, 100);
  };

  if (!authStatus.authenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: "80%",
        transform: "translateX(-50%)",
        width: 360,
        backgroundColor: "#fff",
        borderRadius: expanded ? 3 : "16px 16px 0 0",
        boxShadow: 6,
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {/* Always visible header */}
      <Box
        onClick={toggleChat}
        sx={{
          display: "flex",
          alignItems: "center", 
          justifyContent: "space-between", 
          backgroundColor: "#673ab7",
          color: "#fff",
          px: 2,
          py: 1,
          cursor: "pointer",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          ChatBot
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="small"
            sx={{
              color: "#fff",
              p: 0.5, // slight padding looks better (you can set 0 if you want tighter)
            }}
          >
            {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Expandable chat */}
      <Collapse in={expanded}>
        <Box sx={{ display: "flex", flexDirection: "column", height: 460 }}>
          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              backgroundColor: "#fafafa",
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  backgroundColor: msg.sender === "bot" ? "#e1bee7" : "#c5cae9",
                  color: "#4a148c",
                  p: 1.5,
                  borderRadius: 2,
                  mb: 1,
                  maxWidth: "80%",
                  fontSize: "14px",
                  wordBreak: "break-word",
                }}
              >
                {msg.type === "text" && (
                  <Typography sx={{ whiteSpace: "pre-line" }}>{msg.text}</Typography>
                )}
                {msg.type === "prediction" && (
                  <>
                    <Typography sx={{ mb: 1 }}>🚀 Here are your prediction results:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {msg.predictions.map((pred, i) => (
                        <Chip
                          key={i}
                          label={`${pred.label} (${pred.confidence}%)`}
                          color="secondary"
                          variant="outlined"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            ))}

            {loading && (
              <Typography
                sx={{
                  fontStyle: "italic",
                  fontSize: "14px",
                  color: "#aaa",
                  mt: 1,
                }}
              >
                Bot is typing...
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input area */}
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1.5,
              borderTop: "1px solid #ddd",
              backgroundColor: "#f9f9f9",
            }}
          >
            <TextField
              inputRef={inputRef}
              placeholder="Type a message (or JavaScript code)..."
              variant="outlined"
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              fullWidth
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" },
                  "& textarea": { padding: "12px" },
                },
                fontSize: "14px",
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={message.trim() === ""}
              sx={{
                ml: 2,
                backgroundColor: "#673ab7",
                color: "#fff",
                "&:hover": { backgroundColor: "#5e35b1" },
                width: 56,
                height: 56,
              }}
            >
              <SendIcon fontSize="medium" />
            </IconButton>
          </Paper>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Footer;
