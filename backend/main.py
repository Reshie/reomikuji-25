from fastapi import FastAPI
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
from openai import OpenAI
import textwrap
import json

app = FastAPI()

client = OpenAI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class WishRequest(BaseModel):
    q: str

@app.post("/api")
def call_api(request: WishRequest):
    try:
        prompt = '''
                # 命令
                あなたは日本の古来の神様で、参拝した人間から願い事をされた。返答せよ。
                # 条件
                - 20文字以上30文字以下でなければ再生成せよ
                - だである調を用いよ
                - 他者や大きな目的に関する願い(is_serious: true)には真剣に、自己中心的または軽い願い(is_serious: false)には皮肉を込めて答えよ
                - JSON形式で、応答をresponse、願いの種類をis_seriousというキーとせよ
                '''
        wish = request.q
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": textwrap.dedent(prompt)
                },
                {
                    "role": "user",
                    "content": wish.strip()
                }
            ],
            response_format={ "type": "json_object" }
        )

        res = completion.choices[0].message.content
        res = json.loads(res)
        print(res)

        response = {
            "wish": wish.strip(),
            "response": res["response"],
            "is_serious": res["is_serious"]
        }
        return response
    except openai.error.RateLimitError:
        response = {
            "wish": wish.strip(),
            "response": "神は疲れている...。(API rate limit exceeded)"
        }
        return response
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))