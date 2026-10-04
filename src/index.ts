
import { Agent } from "./agent";

import React from 'react';
import { render } from 'ink';
import App from "../tui/app";

// Clear the screen first for a clean TUI experience
console.clear(); 

// Render the application
render(React.createElement(App));



const agent = new Agent();
const userInput = process.argv.slice(2).join(" ") || "Say hello and tell me what tools you have.";

await agent.run(userInput, {
    onText: (chunk) => process.stdout.write(chunk),
    onToolStart: (name, input) => console.log(`\n[tool] ${name}`, input),
    onToolEnd: (name, result) =>
        console.log(`[tool done] ${name}: ${result.isError ? "ERROR - " + result.content : "ok"}`),
    onDone: () => console.log("\n"),
});

