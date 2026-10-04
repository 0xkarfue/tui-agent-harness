import { Box, Text } from "ink"


import { useState } from "react";
import { TextInput } from "../../components/ui/text-input";
import MainPromptScreen from "./prompt-screen";


export default function WelcomeScreen() {

    const [currentScreen, setCurrentScreen] = useState<'welcome' | 'prompt'>('welcome');
    const [dummyInput, setDummyInput] = useState('');

    if (currentScreen === 'prompt') {
        return <MainPromptScreen />;
    }


    return (

        <Box flexDirection="column" borderStyle="round" borderColor="blueBright" padding={1}>
            <Box flexDirection="column" borderStyle="round" borderColor="blueBright" padding={1}><Text> ✨ Harsh Code </Text></Box>
            <Box flexDirection="column" marginTop={1} marginBottom={1}>
                <Box flexDirection="column" marginBottom={0}>
                    <Text bold color="blue">█  █  ███  ███  ███  █  █</Text>
                    <Text bold color="blue">█  █  █ █  █ █  █    █  █</Text>
                    <Text bold color="blue">████  ███  ██   ███  ████</Text>
                    <Text bold color="blue">█  █  █ █  █ █    █  █  █</Text>
                    <Text bold color="blue">█  █  █ █  █ █  ███  █  █</Text>
                </Box>

                <Box flexDirection="column" marginTop={1} marginBottom={2}>
                    <Text bold color="blue"> ███  ███  ███  ███</Text>
                    <Text bold color="blue"> █    █ █  █ █  █  </Text>
                    <Text bold color="blue"> █    █ █  █ █  ██ </Text>
                    <Text bold color="blue"> █    █ █  █ █  █  </Text>
                    <Text bold color="blue"> ███  ███  ███  ███</Text>
                </Box>
            </Box>

            <Box>
                <TextInput
                    label="Press ENTER to continue "
                    value={dummyInput}
                    onChange={setDummyInput}
                    onSubmit={() => setCurrentScreen('prompt')}
                />
            </Box>

        </Box>

    )
}