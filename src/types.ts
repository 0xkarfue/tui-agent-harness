import * as z from "zod";

export type Role = "user" | "assistant";


export type ContentBlock = {
    type: "text";
    text: string
} | {
    type: "tool_use";
    id: string;
    name: string;
    input: unknown
} | {
    type: "tool_result";
    toolUseId: string;
    content: string;
    isError: boolean
};

export type Message = {
    role: Role;
    content: ContentBlock[]
};

export type ToolResult = {
    content: string;
    isError: boolean
}

export type ToolDefinition = {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
    execute: (input: any) => Promise<ToolResult>
}

export type AgentCallbacks = {
    onText: (chunk: string) => void;
    onToolStart: (name: string, input: unknown) => void;
    onToolEnd: (name: string, result: ToolResult) => void;
    onDone: (finalMessage: Message) => void;
}