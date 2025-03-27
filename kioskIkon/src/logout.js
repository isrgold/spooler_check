function showConfirmationModal() {
    return new Promise((resolve) => {
        let isConfirmed = false;

        // Show the confirmation modal
        document.getElementById('confirmModal').classList.remove('hidden');

        // Add event listeners for both "OK" and "No" buttons
        document.getElementById('outOk').addEventListener('click', () => {
            isConfirmed = true;
            resolve(isConfirmed);
        });

        document.getElementById('outNo').addEventListener('click', () => {
            isConfirmed = false;
            resolve(isConfirmed);
        });
    });
}

export async function handleLogout() {
    const isConfirmed = await showConfirmationModal(); // Wait for the user's decision
    document.getElementById('confirmModal').classList.add('hidden');

    if (isConfirmed) {
        await Command.create('logout').execute();
    }
}


