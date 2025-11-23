const app = require('./src/app')
require('dotenv').config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse = require('./src/service/ai.service');


const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
    console.log("a user is connected");
  // ...
  socket.on("disconnect", () =>{
    console.log("A user disconnected");
  })
  
  socket.on("ai-mess", async(data) =>{
    // Log the full incoming payload for easier debugging
    console.log('Received AI message payload:', data);

    // Accept multiple payload shapes for backward compatibility:
    // - { prompt: '...' }
    // - { message: '...' }
    // - a raw string (client emitted a string)
    // - an array of content pieces
    const prompt = (data && (data.prompt || data.message)) || (typeof data === 'string' ? data : undefined) ||
      (Array.isArray(data) ? data : undefined);

    if (!prompt) {
      const errMsg = 'No prompt found in ai-mess payload; expected { prompt: "..." } or a string.';
      console.warn(errMsg, 'payload=', data);
      socket.emit('ai-error', { error: errMsg });
      return;
    }

    try {
      const response = await generateResponse(prompt);
      console.log("AI-response:", response);
      socket.emit('ai-res', { text: response });
      socket.emit("ai-response", { response });

    } catch (err) {
      console.error('AI generate error:', err && err.message ? err.message : err);
      socket.emit('ai-error', { error: err && err.message ? err.message : String(err) });
    }
  })
  // socket.emit("ai-response", {response})
});

httpServer.listen(3000, () => {
    console.log("server is running on port 3000");
})