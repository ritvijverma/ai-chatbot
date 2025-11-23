const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('connected to server');
  // send a sample prompt
  socket.emit('ai-mess', { prompt: 'Write a short greeting and a joke.' });
});

socket.on('ai-res', (data) => {
  console.log('ai-res:', data);
  socket.disconnect();
});

socket.on('ai-error', (err) => {
  console.error('ai-error:', err);
  socket.disconnect();
});

socket.on('connect_error', (err) => {
  console.error('connect_error:', err);
});
