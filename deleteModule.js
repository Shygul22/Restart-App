// deleteModule.js

// Global variable to store the callback function for confirmation
let confirmCallback = null;

// Function to show the confirmation dialog
function showConfirmationDialog(message, callback) {
    const dialog = document.getElementById('confirmation-dialog');
    const messageElement = document.getElementById('confirmation-message');
    const confirmButton = document.getElementById('confirm-btn');
    const cancelButton = document.getElementById('cancel-btn');

    // Set the message in the dialog
    messageElement.textContent = message;
    confirmCallback = callback; // Store the callback function
    dialog.style.display = 'flex'; // Show the dialog

    // Confirm button action
    confirmButton.onclick = () => {
        if (confirmCallback) {
            confirmCallback(); // Execute the callback function
        }
        dialog.style.display = 'none'; // Hide the dialog
    };

    // Cancel button action
    cancelButton.onclick = () => {
        dialog.style.display = 'none'; // Hide the dialog
    };
}

// Function to handle delete action
function deleteTask(taskItem) {
    showConfirmationDialog('Are you sure you want to delete this task?', () => {
        taskItem.remove(); // Remove the task item from the list
        // Optionally close the task detail panel
        closeTaskDetail(); 
    });
}

// Function to close task details panel
function closeTaskDetail() {
    const taskDetailPanel = document.getElementById('task-detail-panel');
    taskDetailPanel.classList.remove('open');
}

// Export the functions to be used in other modules or scripts
export { deleteTask };
