const { invoke } = window.__TAURI__.core;
const { TrayIcon } = window.__TAURI__.tray;
const { defaultWindowIcon } = window.__TAURI__.app;
const { Menu } = window.__TAURI__.menu;

export async function createTray() {
    const menu = await Menu.new({
        items: [
            {
                id: 'unistall',
                text: 'unistall',
                action: () => { invoke('request_admin', { action: "uninstall" }); }
            },
        ],
    });

    const options = {
        icon: await defaultWindowIcon(),
        menu,
        menuOnLeftClick: true,
    };

    await TrayIcon.new(options);
}