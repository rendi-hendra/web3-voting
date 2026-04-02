const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const electionRoutes = require('./src/routes/election.routes');
const authRoutes = require('./src/routes/auth.routes');

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
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Web3 Voting API with Clean Architecture is running...');
});

app.use('/api/elections', electionRoutes);
app.use('/api/auth', authRoutes);

// Web3 Integration
const { votingContract } = require('./src/infrastructure/ethers');
const prisma = require('./src/infrastructure/prisma');

if (votingContract) {
  votingContract.on("VoteCast", async (voterAddress, candidateId, electionId, event) => {
    console.log(`\n[Web3 Event] VoteCast detected!`);
    const txHash = event.log.transactionHash;

    // 1. Sync to Database
    try {
      // Find or create voter
      let dbVoter = await prisma.voter.findUnique({ where: { walletAddress: voterAddress } });
      if (!dbVoter) {
        dbVoter = await prisma.voter.create({
          data: { name: `Voter ${voterAddress.slice(0, 6)}`, walletAddress: voterAddress }
        });
      }

      // Record the vote if it doesn't exist
      await prisma.vote.upsert({
        where: {
          voterId_electionId: {
            voterId: dbVoter.id,
            electionId: Number(electionId)
          }
        },
        update: { txHash },
        create: {
          voterId: dbVoter.id,
          electionId: Number(electionId),
          candidateId: Number(candidateId),
          txHash
        }
      });
      console.log(`- Database synced for Tx: ${txHash}`);
    } catch (err) {
      console.error("- Database sync failed:", err.message);
    }
    
    // 2. Broadcast to all connected clients
    io.emit("voteCast", {
      voter: voterAddress,
      candidateId: Number(candidateId),
      electionId: Number(electionId),
      txHash
    });
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
