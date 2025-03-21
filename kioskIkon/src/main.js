const { Command } = window.__TAURI__.shell;
const  { invoke }  = window.__TAURI__.core;

async function getRegistryValue() {
  try {
    const value = await invoke('get_registry_value');
    console.log('Registry value:', value); // You can process the result here
  } catch (error) {
    console.error('Failed to get registry value:', error);
  }
}

async function run_script() {
  const res = await Command.create('exec-cscript').execute();
  console.log(res);
}

async function start_explore() {
  const res = await Command.create('start-explorer').execute();
  console.log(res);
}

const correctSequence = ["F5", "1", "2"]; // Define the required sequence
let inputSequence = [];

document.addEventListener("keydown", function (event) {
  // event.preventDefault(); // Prevent default key actions
  if (event.key === correctSequence[inputSequence.length]) {
    inputSequence.push(event.key); // Add key to sequence
    if (inputSequence.length === correctSequence.length) {
      start_explore();
      inputSequence = []; // Reset after success
    }
  } else {
    inputSequence = []; // Reset on wrong input
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById('icon');
  icon.addEventListener('click', run_script);
  // document.addEventListener('contextmenu', (e) => e.preventDefault());
  run_script();
  // getRegistryValue();
});
