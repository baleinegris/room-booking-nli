from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

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

@app.post("/predict")
async def predict(item: PredictRequest) -> Union[str, dict]:
    return {"group_name": item.group_name, "event_title": item.event_title, "event_description": item.event_description, "rule": item.rule}

