const { Command } = window.__TAURI__.shell;

function showConfirmationModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalLayout');
        let isConfirmed = false;

        // Show the confirmation modal
        modal.classList.remove('hidden');

        // Add event listeners for both "OK" and "No" buttons
        document.getElementById('outOk').addEventListener('click', () => {
            isConfirmed = true;
            resolve(isConfirmed);
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                isConfirmed = false;
                resolve(isConfirmed);
            }
        });

        document.getElementById('outNo').addEventListener('click', () => {
            isConfirmed = false;
            resolve(isConfirmed);
        });
    });
}

export async function handleLogout() {
    const isConfirmed = await showConfirmationModal(); // Wait for the user's decision
    document.getElementById('modalLayout').classList.add('hidden');

    if (isConfirmed) {
        await Command.create('logout').execute();
    }
}


