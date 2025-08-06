from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from pydantic import BaseModel

from nli_pipeline import start, predict, explain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    group_name: str
    event_title: str
    event_description: str
    rule: str

class ExplainRequest(BaseModel):
    group_name: str
    event_title: str
    event_description: str
    rule: str
    focus_class: str = "entailment"


@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup."""
    try:
        start()
    except Exception as e:
        print(f"Error starting model: {e}")

@app.post("/predict")
async def hanldePredict(item: PredictRequest) -> Union[str, dict]:
    return predict(item.group_name, item.event_title, item.event_description, item.rule)

@app.post("/explain")
async def handleExplain(item: ExplainRequest) -> Response:
    """Return a heatmap image explaining the NLI prediction"""
    image_bytes = explain(
        item.group_name, 
        item.event_title, 
        item.event_description, 
        item.rule, 
        item.focus_class
    )
    return Response(content=image_bytes, media_type="image/png")

