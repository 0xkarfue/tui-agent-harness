import { buildSystemPrompt } from "./prompt";
import { sendMessage } from "./providers/openrouter";
import { tools } from "./tools";
import type { AgentCallbacks, ContentBlock, Message } from "./types";


export class Agent {
    private messages: Message[] = [];

    async run(userInput: string, callbacks: AgentCallbacks) {
        this.messages.push({ role: "user", content: [{ type: "text", text: userInput }] });

        const systemPrompt = buildSystemPrompt(process.cwd());

        const toolList = Object.values(tools);

        try {
            for (let i = 0; i < 30; i++) {
                const assistantMessage = await sendMessage(
                    systemPrompt,
                    this.messages,
                    toolList,
                    callbacks.onText
                );
                this.messages.push(assistantMessage);

                const toolUseBlocks = assistantMessage.content.filter(
                    (b) => b.type === "tool_use"
                ) as Extract<ContentBlock, { type: "tool_use" }>[]

                if (toolUseBlocks.length === 0) {
                    callbacks.onDone(assistantMessage);
                    return;
                }

                const resultBlocks: ContentBlock[] = [];

                for (const call of toolUseBlocks) {
                    callbacks.onToolStart(call.name, call.input);

                    const tool = tools[call.name];

                    const result = tool
                        ? await tool.execute(call.input)
                        : { content: `Unknown tool: ${call.name}`, isError: true };

                    callbacks.onToolEnd(call.name, result);

                    resultBlocks.push({
                        type: "tool_result",
                        toolUseId: call.id,
                        content: result.content,
                        isError: result.isError,
                    });

                }

                this.messages.push({ role: "user", content: resultBlocks });

            }

            callbacks.onDone({
                role: "assistant",
                content: [{ type: "text", text: "Hit iteration limit (30 loops)." }],
            });
        } catch (err) {
            callbacks.onDone({
                role: "assistant",
                content: [{ type: "text", text: `Something went wrong: ${err instanceof Error ? err.message : String(err)}` }],
            });
        }

    }
}

