import sys
import os

# Ensure we can import from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from optimizer_pipeline import TokenOptimizerPipeline

app = FastAPI(title="Token Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = TokenOptimizerPipeline()

class OptimizeRequest(BaseModel):
    prompt: str

class SimilarityRequest(BaseModel):
    text1: str
    text2: str

similarity_model = None

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Token Optimizer API is running"}

@app.post("/api/v1/optimize")
def optimize_prompt(req: OptimizeRequest):
    try:
        is_emergency = "emergency state" in req.prompt.lower()
        results = pipeline.run(req.prompt, emergency=is_emergency)
        
        # Extract final token count and prompt from results
        # Depending on if it bypassed L2/L3, the final layer might be layer4 or layer4_5
        final_layer_key = "layer4_5" if "layer4_5" in results else "layer4"
        final_layer = results[final_layer_key]
        
        original_tokens = results["layer1"].token_count
        final_tokens = final_layer.token_count
        saved_tokens = original_tokens - final_tokens
        reduction_pct = (saved_tokens / original_tokens * 100) if original_tokens > 0 else 0

        return {
            "original_prompt": req.prompt,
            "optimized_prompt": final_layer.text,
            "metrics": {
                "original_tokens": original_tokens,
                "optimized_tokens": final_tokens,
                "saved_tokens": saved_tokens,
                "reduction_percentage": round(reduction_pct, 1)
            }
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/v1/similarity")
def check_similarity(req: SimilarityRequest):
    global similarity_model
    try:
        from sentence_transformers import SentenceTransformer, util
        if similarity_model is None:
            similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
            
        embeddings1 = similarity_model.encode(req.text1, convert_to_tensor=True)
        embeddings2 = similarity_model.encode(req.text2, convert_to_tensor=True)
        cosine_scores = util.cos_sim(embeddings1, embeddings2)
        score = float(cosine_scores[0][0]) * 100
        
        return {"similarity_score": round(score, 1)}
    except ImportError:
        return {"error": "sentence-transformers is not installed yet."}
    except Exception as e:
        return {"error": str(e)}
