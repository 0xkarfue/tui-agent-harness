import z from "zod";
import type { ToolDefinition, ToolResult } from "../types";

const readSchema = z.object({
    path: z.string().describe("Path to the file to read (relative or absolute)"),
    offset: z.number().optional().describe("Line number to start reading from (1-indexed)"),
    limit: z.number().optional().describe("Maximum number of lines to read")
})

export async function read(input: z.infer<typeof readSchema>): Promise<ToolResult> {
    const { path } = input;

    try {
        const foo = Bun.file(path);
        const fileContent = await foo.text()

        return {
            content: fileContent || "empty file",
            isError: false,
        };
    } catch (error) {
        return {
            content: `Failed to run command: ${error instanceof Error ? error.message : String(error)} `,
            isError: true,
        };
    }

}

export const readTool: ToolDefinition = {
    name: "read",
    description: "Run a read file and return its text content.",
    schema: readSchema,
    execute: read
}