import * as z from "zod";
import type { ToolDefinition, ToolResult } from "../types";
import { $ } from "bun";


const bashSchema = z.object({
    command: z.string().describe("Shell command to run"),
})

async function execute(input: z.infer<typeof bashSchema>): Promise<ToolResult> {

    const { command } = input;

    // const proc = Bun.spawn(["echo", "hello"]);
    // const output = await proc.stdout.text();
    // console.log(output)

    try {
        // await $`${command}`;


        const proc = Bun.spawn(["bash", "-c", command], {
            stdout: "pipe",
            stdin: "pipe"
        });

        const output = await proc.stdout.text();
        // const errOutput = await proc.stderr.text();
        const exitCode = await proc.exited;



        return {
            content: output || "no output",
            isError: exitCode !== 0,
        };
    } catch (error) {
        return {
            content: `Failed to run command: ${error instanceof Error ? error.message : String(error)} `,
            isError: true,
        };
    }


}

export const bashTool: ToolDefinition = {
    name: "bash",
    description: "Run a shell command and return its stdout/stderr.",
    schema: bashSchema,
    execute,
};