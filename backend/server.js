const express = require('express');
const cors = require('cors');
const { spawn, execSync } = require('child_process');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Register routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TokenLab API Gateway is running' });
});

/**
 * Auto-start Ollama server and pull the llama3 model on backend boot.
 * - Spawns `ollama serve` as a detached background process (no-op if already running)
 * - Waits briefly, then pulls llama3 to ensure the model is available
 */
function startOllama() {
  console.log('[Ollama] Starting Ollama server...');

  // Spawn ollama serve in the background (detached, unref'd so it doesn't block exit)
  const ollamaServe = spawn('ollama', ['serve'], {
    detached: true,
    stdio: 'ignore',
    shell: true
  });
  ollamaServe.unref();

  // Wait 3 seconds for the server to initialize, then pull llama3
  setTimeout(() => {
    console.log('[Ollama] Pulling llama3 model...');
    const pull = spawn('ollama', ['pull', 'llama3'], {
      stdio: 'inherit',
      shell: true
    });

    pull.on('close', (code) => {
      if (code === 0) {
        console.log('[Ollama] llama3 model is ready.');
      } else {
        console.warn(`[Ollama] Pull exited with code ${code}. Model may already be available.`);
      }
    });

    pull.on('error', (err) => {
      console.warn('[Ollama] Could not pull model:', err.message);
    });
  }, 3000);

  ollamaServe.on('error', (err) => {
    console.warn('[Ollama] Could not start Ollama server:', err.message);
    console.warn('[Ollama] Make sure Ollama is installed: https://ollama.com');
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  startOllama();
});
