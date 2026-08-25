const ollamaService = require('../services/ollamaService');
const optimizerService = require('../services/optimizerService');

class LLMController {
  
  async runPlaygroundComparison(req, res) {
    const { prompt, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      // Step 1: Optimize the prompt
      const optimizationResult = await optimizerService.optimizePrompt(prompt);
      const { optimizedPrompt, metrics } = optimizationResult;

      // Step 2: Run both prompts concurrently against Ollama
      const [rawResult, optimizedResult] = await Promise.all([
        ollamaService.generateResponse(prompt, model),
        ollamaService.generateResponse(optimizedPrompt, model)
      ]);

      // Step 3: Compute semantic similarity between the two responses
      const similarityScore = await optimizerService.checkSimilarity(
        rawResult.response,
        optimizedResult.response
      );

      // Step 4: Return the combined payload to the frontend
      res.json({
        original: {
          prompt,
          response: rawResult.response,
          latency: rawResult.latency,
          outputTokens: rawResult.evalCount,
          inputTokens: metrics.original_tokens
        },
        optimized: {
          prompt: optimizedPrompt,
          response: optimizedResult.response,
          latency: optimizedResult.latency,
          outputTokens: optimizedResult.evalCount,
          inputTokens: metrics.optimized_tokens
        },
        metrics,
        similarityScore
      });

    } catch (error) {
      console.error('Playground Comparison Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async chat(req, res) {
    const { prompt, isOptimized, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      let finalPrompt = prompt;

      if (isOptimized) {
        const optResult = await optimizerService.optimizePrompt(prompt);
        finalPrompt = optResult.optimizedPrompt;
      }

      const result = await ollamaService.generateResponse(finalPrompt, model);
      
      res.json({
        response: result.response,
        latency: result.latency
      });

    } catch (error) {
      console.error('Chat Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new LLMController();
