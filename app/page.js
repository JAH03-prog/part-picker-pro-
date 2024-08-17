'use client'
import { Box, Button, Stack, TextField } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I'm PartPickerPro's virtual assistant!`
    }
  ]);

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages)=> [
      ...messages,
      {role: "user", content: message}, 
      {role: "assistant", content: " "},
    ])

    const response = fetch('/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ' '
      return reader.read().then(function processText({done, value}) {
        if(done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream:true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
            content: lastMessage.content + text,
            },
          ]
        })
        return reader.read().then(processText) 
      })
    })
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="800px"
        height="90vh"
        border="1px solid black"
        p={2}
        spacing={2}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              mb={2} // Reduced margin bottom for better spacing between messages
            >
              <Box
                bgcolor={
                  message.role === 'assistant' 
                  ? blue[500] 
                  : grey[600] // Darker grey
                }
                color="white"
                borderRadius={8} // Smaller radius for a less rounded appearance
                padding={2}
                maxWidth="75%"
                wordBreak="break-word"
                lineHeight="1.5"
                boxShadow={message.role === 'assistant' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'} // Subtle shadow
                sx={{
                  ml: message.role === 'assistant' ? 0 : 4, // Indentation for user messages
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />

        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if(e.key === 'Enter' && message.trim()) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <Button
            variant="contained"
            sx={{
              backgroundColor: message.trim() ? blue[500] : 'grey',
              boxShadow: message.trim() ? `0 0 10px ${blue[500]}` : 'none',
              transition: '0.3s',
              '&:hover': {
                backgroundColor: message.trim() ? blue[700] : 'grey',
              }
            }}
            onClick={sendMessage}
            disabled={!message.trim()}
            >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
