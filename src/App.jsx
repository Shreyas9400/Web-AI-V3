import React, { useState, useEffect, useRef } from 'react';
    import axios from 'axios';
    import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
    import SendIcon from '@mui/icons-material/Send';
    import DeleteIcon from '@mui/icons-material/Delete';

    const GRADIO_API_ENDPOINT = 'http://127.0.0.1:7860/api/predict/';

    function App() {
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const messagesEndRef = useRef(null);

      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };

      useEffect(scrollToBottom, [messages]);

      const handleInputChange = (event) => {
        setInput(event.target.value);
      };

      const sendMessage = async () => {
        if (input.trim() === '') return;

        const newUserMessage = { text: input, sender: 'user', timestamp: new Date() };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
          const response = await axios.post(GRADIO_API_ENDPOINT, {
            data: [
              input,
              messages.map((message) => [message.sender === 'user' ? message.text : null, message.sender === 'bot' ? message.text : null]),
              10,
              10000,
              0.8,
              0.1,
              'Combined',
              ['google', 'bing', 'duckduckgo'],
              'Moderate (1)',
              'all - All Languages',
              'groq',
              'Auto (Knowledge Base + Web)',
              false,
            ],
          });

          if (response.data && response.data.data) {
            const botResponse = { text: response.data.data[0], sender: 'bot', timestamp: new Date() };
            setMessages((prevMessages) => [...prevMessages, botResponse]);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          const errorMessage = {
            text: 'Sorry, there was an error processing your request.',
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      };

      const clearChat = () => {
        setMessages([]);
      };

      return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Typography variant="h4" gutterBottom align="center">
            AI Chatbot
          </Typography>
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message here..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              multiline
              rows={2}
            />
            <Button variant="contained" color="primary" onClick={sendMessage} sx={{ ml: 2 }} disabled={isLoading}>
              <SendIcon />
            </Button>
            <Button variant="contained" color="secondary" onClick={clearChat} sx={{ ml: 2 }}>
              <DeleteIcon />
            </Button>
          </Box>
        </Box>
      );
    }

    const Message = ({ message }) => {
      const isUser = message.sender === 'user';
      const timestamp = message.timestamp.toLocaleString();

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: '20px',
              bgcolor: isUser ? 'primary.light' : 'grey.300',
              maxWidth: '70%',
            }}
          >
            <Typography variant="body1">{message.text}</Typography>
            <Typography variant="caption" color="textSecondary">
              {timestamp}
            </Typography>
          </Box>
        </Box>
      );
    };

    export default App;
