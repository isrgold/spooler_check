const { Command } = window.__TAURI__.shell;

async function run_script() {
  await Command.create('exec-cscript').execute();
}

window.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById('icon');

  // Add the event listener to the icon
  icon.addEventListener('click', run_script);

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  })

  run_script();
});