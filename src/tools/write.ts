import z from "zod";
import type { ToolDefinition, ToolResult } from "../types";


const writeSchema = z.object({
    path: z.string().describe("Path to the file to write."),
    content: z.string().describe("Content to write to the file.")
})

export async function write(input: z.infer<typeof writeSchema>): Promise<ToolResult> {
    const { path, content } = input;

    try {
        await Bun.write(path, content);

        return {
            content: `Successfully wrote to ${path}`,
            isError: false
        };

    } catch (error) {
        return {
            content: `Failed to run command: ${error instanceof Error ? error.message : String(error)} `,
            isError: true,
        };
    }
}

export const writeTool: ToolDefinition = {
    name: "write",
    description: "Run a write file and returns a success message.",
    schema: writeSchema,
    execute: write
}