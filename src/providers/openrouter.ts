import dotenv from "dotenv";
import type { AgentCallbacks, ContentBlock, Message, ToolDefinition } from "../types";
import z from "zod";
dotenv.config()


const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemma-4-31b-it:free";
// const MODEL = "inclusionai/ling-3.1-flash:free";



function buildWireMessages(systemPrompt: string, messages: Message[]) {

  const wire: any[] = [{ role: "system", content: systemPrompt }];

  for (const message of messages) {
    for (const block of message.content) {
      if (block.type === "text") {
        wire.push({ role: message.role, content: block.text });
      } else if (block.type === "tool_use") {
        wire.push({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: block.id,
              type: "function",
              function: { name: block.name, arguments: JSON.stringify(block.input) }
            }
          ]
        })
      } else if (block.type === "tool_result") {
        wire.push({ role: "tool", tool_call_id: block.toolUseId, content: block.content });
      }
    }
  }
  return wire;
}


function buildWireTools(tools: ToolDefinition[]) {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: z.toJSONSchema(tool.schema)
    },
  }));
}



export async function sendMessage(
  systemPrompt: string,
  messages: Message[],
  tools: ToolDefinition[],
  onText: AgentCallbacks["onText"]
): Promise<Message> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: buildWireMessages(systemPrompt, messages),
      tools: buildWireTools(tools),
      stream: true
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`OpenRouter request failed: ${res.status} ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  const toolCallAccumulator: Record<number, { id: string, name: string, args: string }> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      const chunk = JSON.parse(data);
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        fullText += delta.content;
        onText(delta.content);
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const existing = toolCallAccumulator[tc.index] ?? { id: "", name: "", args: "" };
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.name = tc.function.name;
          if (tc.function?.arguments) existing.args += tc.function.arguments;
          toolCallAccumulator[tc.index] = existing;
        }
      }


    }
  }


  const content: ContentBlock[] = [];
  if (fullText) {
    content.push({ type: "text", text: fullText });
  }
  for (const call of Object.values(toolCallAccumulator)) {
    content.push({
      type: "tool_use",
      id: call.id,
      name: call.name,
      input: call.args ? JSON.parse(call.args) : {},
    });
  }

  return { role: "assistant", content }

}