const { Command } = window.__TAURI__.shell;

export async function listen_explorer() {
    const correctSequence = ["F5", "1", "2"]; // Define the required sequence
    let inputSequence = [];

    document.addEventListener("keydown", function (event) {
        event.preventDefault(); // Prevent default key actions
        if (event.key === correctSequence[inputSequence.length]) {
            inputSequence.push(event.key); // Add key to sequence
            if (inputSequence.length === correctSequence.length) {
                console.log(inputSequence);
                start_explorer();
                inputSequence = []; // Reset after success
            }
        } else {
            inputSequence = []; // Reset on wrong input
            if (event.key === correctSequence[inputSequence.length]) {
                inputSequence.push(event.key);
            }
        }
    });
}

async function start_explorer() {
    const res = await Command.create('start-explorer').execute();
    console.log(res);
}
