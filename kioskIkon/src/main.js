const { Command } = window.__TAURI__.shell;
const { invoke } = window.__TAURI__.core;
import { createTray } from './tray.js';
import { handleLogout } from './logout.js';
import { listen_explorer } from './openShell.js';

async function getRegistryValue() {
  try {
    await invoke('get_registry_value'); // Invoke the backend function
    run_script();
    createTray();
  } catch (error) {
    // console.error(error);
    if (error === "Administrator user") {
      document.getElementById('registry-result').innerText = `Error: ${error}`
    } else {
      document.getElementById('registry-result').innerHTML = `Error: ${error} <a href="#" id="install">Install kiosk mode</a>`;
      document.getElementById("install").addEventListener("click", function (event) {
        event.preventDefault();
        invoke('request_admin', { action: "install" });
      });
    }
  }
}

async function run_script() {
  const res = await Command.create('exec-cscript').execute();
  console.log(res);
}

window.addEventListener("DOMContentLoaded", () => {
  // document.addEventListener('contextmenu', (e) => e.preventDefault());
  const icon = document.getElementById('icon');
  icon.addEventListener('click', run_script);
  getRegistryValue();
  listen_explorer();
  const out = document.getElementById('logout');
  out.addEventListener('click', handleLogout);
});
