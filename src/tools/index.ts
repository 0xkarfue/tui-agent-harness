import type { ToolDefinition } from "../types";
import { bashTool } from "./bash";
import { readTool } from "./read";
import { writeTool } from "./write";

export const tools: Record<string, ToolDefinition> = {
    [bashTool.name]: bashTool,
    [readTool.name]: readTool,
    [writeTool.name]: writeTool
}

