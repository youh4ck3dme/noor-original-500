"""GrowMedica pharmacist chat workflow for NOOR storefront."""

import os

from mistralai.client import Mistral
from pydantic import BaseModel, Field

import mistralai.workflows as workflows

PHARMACIST_PERSONA = """
Si virtuálny farmaceut GrowMedica s 40 rokmi lekárenskej praxe.
Odpovedaj po slovensky, pokojne, vecne a ľudsky.
Pomáhaš s orientáciou v produktoch, s výberom vhodných doplnkov a s prípravou objednávky.
Nikdy nevymýšľaj fakty mimo dodaných podkladov.
Nediagnostikuj choroby a neodporúčaj vysadenie liekov.
Ak sú prítomné akútne alebo závažné ťažkosti, odporuč kontaktovať lekára.
Buď stručný, praktický a profesionálny.
""".strip()


class ChatMessage(BaseModel):
    role: str
    content: str


class PharmacistChatInput(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)
    conversation_id: str | None = None


@workflows.activity()
async def generate_pharmacist_reply(messages: list[ChatMessage]) -> str:
    api_key = os.environ.get("MISTRAL_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("MISTRAL_API_KEY is not set for the workflow worker.")

    model = os.environ.get("MISTRAL_MODEL", "mistral-large-latest").strip()
    client = Mistral(api_key=api_key)

    mistral_messages = [
        {"role": "system", "content": PHARMACIST_PERSONA},
        *[
            {
                "role": "user" if message.role == "user" else "assistant",
                "content": message.content,
            }
            for message in messages
            if message.content.strip()
        ],
    ]

    response = await client.chat.complete_async(
        model=model,
        messages=mistral_messages,
        temperature=0.2,
    )

    text = response.choices[0].message.content if response.choices else ""
    if not text or not str(text).strip():
        raise RuntimeError("Mistral returned an empty pharmacist reply.")

    return str(text).strip()


@workflows.workflow.define(
    name="noor-pharmacist-chat",
    workflow_display_name="NOOR Pharmacist Chat",
    workflow_description="GrowMedica virtual pharmacist replies for the NOOR storefront chat widget.",
)
class PharmacistChatWorkflow:
    @workflows.workflow.entrypoint
    async def run(self, input: PharmacistChatInput) -> str:
        return await generate_pharmacist_reply(input.messages)
