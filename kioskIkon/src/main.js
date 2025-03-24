const { Command } = window.__TAURI__.shell;
const { invoke } = window.__TAURI__.core;
const { TrayIcon } = window.__TAURI__.tray;
const { defaultWindowIcon } = window.__TAURI__.app;

async function tray() {
  const options = {
    icon: await defaultWindowIcon(),
  };
  
  const tray = await TrayIcon.new(options);
}

async function getRegistryValue() {
  try {
    const value = await invoke('get_registry_value'); // Invoke the backend function
    console.log(value);
    run_script();
  } catch (error) {
    // console.error(error);
    if (error === "Administrator user") {
      invoke('request_admin', {action: "install"} );
      document.getElementById('registry-result').innerText = `Error: ${error}`
    } else {
      document.getElementById('registry-result').innerHTML = `Error: ${error} <a href="#" id="install">Install kiosk mode</a>`;
      document.getElementById("install").addEventListener("click", function (event) {
        event.preventDefault();
        invoke('request_admin');
      });
    }
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

async function logout() {
  const res = await Command.create('logout').execute();
  console.log(res);
}

const correctSequence = ["F5", "1", "2"]; // Define the required sequence
let inputSequence = [];

document.addEventListener("keydown", function (event) {
  event.preventDefault(); // Prevent default key actions
  if (event.key === correctSequence[inputSequence.length]) {
    inputSequence.push(event.key); // Add key to sequence
    if (inputSequence.length === correctSequence.length) {
      console.log(inputSequence);
      start_explore();
      inputSequence = []; // Reset after success
    }
  } else {
    inputSequence = []; // Reset on wrong input
    if (event.key === correctSequence[inputSequence.length]) {
      inputSequence.push(event.key);
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById('icon');
  icon.addEventListener('click', run_script);
  const out = document.getElementById('logout');
  out.addEventListener('click', logout);
  // document.addEventListener('contextmenu', (e) => e.preventDefault());
  getRegistryValue();
  tray();
});
