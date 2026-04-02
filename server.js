const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const electionRoutes = require('./src/routes/election.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Web3 Voting API with Clean Architecture is running...');
});

app.use('/api/elections', electionRoutes);

// Web3 Integration
const { votingContract } = require('./src/infrastructure/ethers');

if (votingContract) {
  votingContract.on("VoteCast", (voter, candidateId, electionId, event) => {
    console.log(`\n[Web3 Event] VoteCast detected!`);
    console.log(`- Voter: ${voter}`);
    console.log(`- Candidate ID: ${candidateId.toString()}`);
    console.log(`- Election ID: ${electionId.toString()}`);
    console.log(`- TxHash: ${event.log.transactionHash}`);
    // Here you would typically dispatch a UseCase to update the local database with the TxHash
  });
} else {
  console.log("[Web3] Contract not loaded. Event listeners disabled.");
}

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Port configuration
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
