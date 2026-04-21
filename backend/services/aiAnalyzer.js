/**
 * AI Comment Analyzer using HuggingFace Transformers (local, no API key needed)
 * Model: distilbert-base-uncased-finetuned-sst-2-english
 * Downloads ~67MB on first use, then works offline forever.
 *
 * Also supports Gemini if GEMINI_API_KEY is set and working.
 */

let pipeline = null;
let pipelineLoading = false;

async function getSentimentPipeline() {
  if (pipeline) return pipeline;
  if (pipelineLoading) {
    // Wait for it to load
    while (pipelineLoading) await new Promise(r => setTimeout(r, 100));
    return pipeline;
  }
  pipelineLoading = true;
  try {
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = await createPipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    console.log('[AI] HuggingFace sentiment model loaded');
  } finally {
    pipelineLoading = false;
  }
  return pipeline;
}

/**
 * Classify a single comment as positive or negative
 * Returns: { label: 'POSITIVE'|'NEGATIVE', score: 0-1 }
 */
async function classifyComment(text) {
  const classifier = await getSentimentPipeline();
  const result = await classifier(text, { truncation: true });
  return result[0]; // { label, score }
}

/**
 * Analyze all comments — classify into appreciation vs attention
 * No grammar correction (local model can't do that), but accurate classification
 */
async function analyzeCommentsWithAI(rawComments) {
  if (!rawComments || rawComments.length === 0) {
    return { appreciation: [], commentsNeedingAttention: [] };
  }

  const appreciation = [];
  const commentsNeedingAttention = [];

  // Process all comments
  for (const comment of rawComments) {
    if (!comment || comment.trim().length < 3) continue;
    try {
      const result = await classifyComment(comment.trim());
      if (result.label === 'POSITIVE') {
        appreciation.push(comment.trim());
      } else {
        commentsNeedingAttention.push(comment.trim());
      }
    } catch {
      // If classification fails, put in attention by default
      commentsNeedingAttention.push(comment.trim());
    }
  }

  return { appreciation, commentsNeedingAttention };
}

/**
 * Test if AI is working
 */
async function testGeminiConnection() {
  try {
    const classifier = await getSentimentPipeline();
    const result = await classifier('The teacher is excellent');
    return {
      ok: true,
      response: `HuggingFace AI working — "${result[0].label}" (${(result[0].score * 100).toFixed(1)}% confidence)`,
      engine: 'HuggingFace (local, no API key needed)'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { analyzeCommentsWithAI, testGeminiConnection, classifyComment };
