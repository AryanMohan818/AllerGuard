import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

# Initialize FastAPI application
app = FastAPI(
    title="AllerGuard API",
    description="Culinary safety analyzer powered by Google Gemma 2"
)

# Allow Cross-Origin Resource Sharing (CORS) for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama connection settings (in Docker, "ollama" resolves to the Ollama container)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma2:2b")


# Request schema: What the frontend sends to this API
class AnalyzeRequest(BaseModel):
    recipe_text: str = Field(..., description="The recipe or ingredients list to scan")
    allergies: List[str] = Field(..., description="List of user's allergies or sensitivities")
    friend_name: Optional[str] = Field(default="My Roommate", description="Name of the friend")


# Response schema items
class HazardItem(BaseModel):
    ingredient: str
    risk_level: str  # HIGH, MEDIUM, LOW
    reason: str
    safe_substitute: str


# Final structured response schema
class AnalyzeResponse(BaseModel):
    is_safe: bool
    summary: str
    hazards: List[HazardItem]
    safe_recipe_modifications: str


@app.get("/health")
def health_check():
    """Simple health check endpoint to verify backend is up."""
    return {"status": "ok", "model": MODEL_NAME, "ollama_url": OLLAMA_BASE_URL}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_recipe(req: AnalyzeRequest):
    """
    Receives recipe and allergy profile, prompts Gemma 2,
    and returns a structured safety report.
    """
    prompt = f"""You are AllerGuard, a culinary safety AI expert.
Your mission is to protect {req.friend_name} from food allergies and dietary hazards.

KNOWN ALLERGIES & SENSITIVITIES:
{', '.join(req.allergies)}

RECIPE / INGREDIENT LIST TO CHECK:
\"\"\"{req.recipe_text}\"\"\"

TASK:
1. Carefully inspect every ingredient and hidden allergen (e.g., soy sauce contains wheat/gluten, pesto contains tree nuts, Worcestershire contains fish, whey contains dairy).
2. Flag any hazardous ingredients.
3. Suggest a 1-to-1 delicious safe substitute for each hazard.
4. Output your analysis ONLY in valid JSON matching this exact structure:
{{
  "is_safe": true or false,
  "summary": "Brief 1-2 sentence overall verdict for {req.friend_name}",
  "hazards": [
    {{
      "ingredient": "Name of offending ingredient",
      "risk_level": "HIGH",
      "reason": "Why it triggers their allergy",
      "safe_substitute": "Safe alternative to use instead"
    }}
  ],
  "safe_recipe_modifications": "Brief advice on how to prepare this dish safely without cross-contamination"
}}

Respond with strictly the JSON object and nothing else.
"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json"  # Forces Ollama to constrain generation to valid JSON
    }

    try:
        # Send asynchronous request to the Ollama container
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=502, 
                    detail=f"Ollama returned status {response.status_code}: {response.text}"
                )
            
            result = response.json()
            raw_text = result.get("response", "{}")
            
            # Parse the JSON returned by Gemma 2
            parsed_data = json.loads(raw_text)
            return parsed_data

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot connect to Ollama at {OLLAMA_BASE_URL}. Is the container running?"
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Failed to parse model response into structured JSON."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))