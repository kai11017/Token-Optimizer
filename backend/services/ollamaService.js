const axios = require('axios');

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';

class OllamaService {
  /**
   * Generates a response using Ollama generate endpoint.
   * @param {string} prompt 
   * @param {string} model 
   * @returns {Promise<Object>} { response, latency, tokens }
   */
  async generateResponse(prompt, model = 'llama3') {
    const startTime = Date.now();
    try {
      const res = await axios.post(`${OLLAMA_API_URL}/generate`, {
        model,
        prompt,
        stream: false
      });

      const latency = (Date.now() - startTime) / 1000; // in seconds

      return {
        response: res.data.response,
        latency,
        evalCount: res.data.eval_count || 0,
      };
    } catch (error) {
      console.error('Error calling Ollama API:', error.message);
      throw new Error('Failed to generate response from Ollama. Is Ollama running?');
    }
  }
}

module.exports = new OllamaService();
