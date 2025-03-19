const { Command } = window.__TAURI__.shell;

async function run_script() {
  const res = await Command.create('exec-cscript').execute();
  console.log(res);
}

const correctSequence = ["F5", "1", "2"]; // Define the required sequence
let inputSequence = [];

document.addEventListener("keydown", function (event) {
  event.preventDefault(); // Prevent default key actions
  if (event.key === correctSequence[inputSequence.length]) {
    inputSequence.push(event.key); // Add key to sequence
    console.log(`Key "${event.key}" detected. Progress: ${inputSequence.join(" → ")}`);

    if (inputSequence.length === correctSequence.length) {
      console.log("Full sequence detected! Running script...");
      run_script();
      inputSequence = []; // Reset after success
    }
  } else {
    console.log(`Wrong key "${event.key}". Sequence reset.`);
    inputSequence = []; // Reset on wrong input
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById('icon');
  icon.addEventListener('click', run_script);
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  run_script();
});
