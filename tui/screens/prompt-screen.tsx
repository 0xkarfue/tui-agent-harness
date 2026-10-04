import { Box, Text } from "ink";
import { useRef, useState } from "react";
import { TextInput } from "../../components/ui/text-input";
import { Agent } from "../../src/agent";

function MainPromptScreen() {
    const [query, setQuery] = useState('');
    const [responseText, setResponseText] = useState("");
    const [toolEvents, setToolEvents] = useState<
        { name: string; status: "running" | "done"; error?: boolean }[]
    >([]);

    const agentRef = useRef(new Agent());

    const handleSubmit = (value: string) => {
        setQuery('');
        setResponseText('');
        setToolEvents([]);

        agentRef.current.run(value, {
            onText: (chunk) => setResponseText((prev) => prev + chunk),
            onToolStart: (name, input) =>
                setToolEvents((prev) => [...prev, { name, status: "running" }]),
            onToolEnd: (name, result) =>
                setToolEvents((prev) =>
                    prev.map((e) =>
                        e.name === name && e.status === "running"
                            ? { ...e, status: "done", error: result.isError }
                            : e
                    )
                ),
            onDone: () => { },
        })
    }


    return (
        <Box flexDirection="column" minHeight={10} justifyContent="space-between" padding={1}>
            <Box flexDirection="row" borderStyle="single" borderColor="blueBright" paddingX={1}>
                <Text bold color="blueBright">✨ HARSH CODE</Text>
                <Text dimColor> | Active Session</Text>
            </Box>

            <Box flexDirection="column" flexGrow={1} marginTop={1} marginBottom={1}>
                {toolEvents.map((e, i) => (
                    <Text key={i} color={e.error ? "red" : "yellow"}>
                        [{e.status === "running" ? "..." : e.error ? "✗" : "✓"}] {e.name}
                    </Text>
                ))}
                <Text>{responseText || "Ready for your instructions..."}</Text>
            </Box>

            <Box borderStyle="round" borderColor="gray" paddingX={1}>
                <TextInput
                    label="> "
                    value={query}
                    onChange={setQuery}
                    placeholder="Ask harsh code anything..."
                    onSubmit={handleSubmit}
                />
            </Box>
        </Box>

    )
}

export default MainPromptScreen;