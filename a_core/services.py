from typing import Generator

from django.conf import settings
from openai import OpenAI


class JonatanBot:
    def __init__(self):
        self.client = OpenAI()

    def generate(self, query: str) -> Generator[str, None, None]:
        """Generate response using OpenAI LLM"""
        messages = [{"role": "user", "content": query}]

        response = self.client.chat.completions.create(
            model=settings.OPENAI_MODEL_NAME,
            messages=messages,
            stream=True,
        )

        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
