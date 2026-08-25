const axios = require('axios');

const OPTIMIZER_API_URL = process.env.OPTIMIZER_API_URL || 'http://localhost:8000/api/v1/optimize';
const SIMILARITY_API_URL = process.env.SIMILARITY_API_URL || 'http://localhost:8000/api/v1/similarity';

class OptimizerService {
  /**
   * Calls the Python Token Optimizer API to compress the prompt.
   * @param {string} prompt 
   * @returns {Promise<Object>} { optimized_prompt, metrics }
   */
  async optimizePrompt(prompt) {
    try {
      const response = await axios.post(OPTIMIZER_API_URL, { prompt });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return {
        optimizedPrompt: response.data.optimized_prompt,
        metrics: response.data.metrics
      };
    } catch (error) {
      console.error('Error calling Optimizer API:', error.message);
      throw new Error('Failed to optimize prompt. Is the Python FastAPI server running?');
    }
  }

  /**
   * Calls the Python similarity endpoint to compute semantic similarity.
   * Returns null on failure so the playground flow is never broken.
   * @param {string} text1 
   * @param {string} text2 
   * @returns {Promise<number|null>} similarity score (0-100) or null
   */
  async checkSimilarity(text1, text2) {
    try {
      const response = await axios.post(SIMILARITY_API_URL, { text1, text2 });

      if (response.data.error) {
        console.warn('Similarity API returned an error:', response.data.error);
        return null;
      }

      return response.data.similarity_score;
    } catch (error) {
      console.warn('Similarity API unreachable, skipping:', error.message);
      return null;
    }
  }
}

module.exports = new OptimizerService();
