// Function to show a notification
function showNotification(title, options) {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    } else {
        console.log('Notification permission is not granted.');
    }
}

// Function to check and trigger notifications
function checkNotifications() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const now = new Date().getTime();

    tasks.forEach(task => {
        const reminderTime = new Date(task.reminderTime).getTime();
        const dueTime = new Date(task.dueTime).getTime();

        if (reminderTime && now >= reminderTime && !task.reminderNotified) {
            // Trigger reminder notification
            showNotification('Reminder', {
                body: task.text,
                icon: 'path/to/icon.png' // Optional: path to an icon image
            });
            task.reminderNotified = true; // Mark as notified
        }

        if (dueTime && now >= dueTime && !task.dueNotified) {
            // Trigger due date notification
            showNotification('Due Date', {
                body: task.text,
                icon: 'path/to/icon.png' // Optional: path to an icon image
            });
            task.dueNotified = true; // Mark as notified
        }
    });

    // Save the updated tasks with notification status
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Check notifications every minute
setInterval(checkNotifications, 60000);

// Function to save task details including notification status
function saveTaskDetails() {
    if (currentTaskItem) {
        const taskNotes = document.getElementById('task-notes').value;
        const reminderTime = document.getElementById('reminder-time').value;
        const repeatMode = document.getElementById('repeat-mode').value;
        const dueTime = document.getElementById('due-time').value;
        const subtasks = Array.from(document.getElementById('subtasks-list').children).map(subtask => subtask.textContent);

        currentTaskItem.dataset.notes = taskNotes;
        currentTaskItem.dataset.reminderTime = reminderTime;
        currentTaskItem.dataset.repeatMode = repeatMode;
        currentTaskItem.dataset.dueTime = dueTime;
        currentTaskItem.dataset.subtasks = JSON.stringify(subtasks);

        // Mark notifications as not notified
        currentTaskItem.dataset.reminderNotified = 'false';
        currentTaskItem.dataset.dueNotified = 'false';

        saveTasks(); // Save tasks to local storage
    }
}

// Function to show the cookie consent alert
function showCookieConsent() {
    const consentBanner = document.getElementById('cookie-consent');
    const hasConsented = localStorage.getItem('cookieConsent');
    
    if (!hasConsented) {
        consentBanner.style.display = 'block';
    }
}

// Function to handle user response to the cookie consent
function handleCookieConsent(accepted) {
    const consentBanner = document.getElementById('cookie-consent');
    if (accepted) {
        localStorage.setItem('cookieConsent', 'yes');
        // Initialize cookie-related functionality if needed
    } else {
        localStorage.setItem('cookieConsent', 'no');
        // Handle the scenario when cookies are declined (e.g., disable features)
    }
    consentBanner.style.display = 'none';
}

// Event listeners for cookie consent buttons
document.getElementById('accept-cookies').addEventListener('click', () => handleCookieConsent(true));
document.getElementById('decline-cookies').addEventListener('click', () => handleCookieConsent(false));

// Function to add a new task
function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    
    if (taskText !== "") {
        const taskList = document.getElementById('task-list');

        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        taskItem.innerHTML = `
            <span>${taskText}</span>
            <div>
                <input type="radio" class="completion-radio" />
            </div>
        `;
        taskItem.addEventListener('click', () => showTaskDetail(taskText, taskItem));

        // Add event listener for the radio button
        taskItem.querySelector('.completion-radio').addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from triggering task item click event
            markAsCompleted(taskItem);
        });

        taskList.appendChild(taskItem);
        taskInput.value = '';
        toggleSidePanel(); // Close the side panel after adding a task

        saveTasks(); // Save tasks to local storage
    }
}

// Function to mark a task as completed
function markAsCompleted(taskItem) {
    taskItem.classList.toggle('completed');

    const radioButton = taskItem.querySelector('.completion-radio');
    radioButton.checked = taskItem.classList.contains('completed');

    saveTasks(); // Save tasks to local storage
}

// Function to show confirmation dialog
function showConfirmationDialog(taskItem) {
    const confirmationDialog = document.getElementById('confirmation-dialog');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    confirmationDialog.style.display = 'flex'; // Show the dialog

    confirmBtn.onclick = () => {
        deleteTask(taskItem); // Proceed with deletion
        confirmationDialog.style.display = 'none'; // Hide the dialog
    };

    cancelBtn.onclick = () => {
        confirmationDialog.style.display = 'none'; // Hide the dialog
    };
}

// Function to delete a task
function deleteTask(taskItem) {
    taskItem.remove(); // Remove the task item from the list
    closeTaskDetail(); // Optionally close the task detail panel after deletion

    saveTasks(); // Save tasks to local storage
}

// Function to toggle the side panel
function toggleSidePanel() {
    const sidePanel = document.getElementById('side-panel');
    sidePanel.classList.toggle('open');
}

// Function to show task details
let currentTaskItem = null; // Global variable to store the current task item

function showTaskDetail(taskText, taskItem) {
    const taskDetailPanel = document.getElementById('task-detail-panel');
    const taskDetailText = document.getElementById('task-detail-text');
    const deleteButton = document.getElementById('delete-task-btn');
    const taskNotes = document.getElementById('task-notes');
    const reminderTime = document.getElementById('reminder-time');
    const repeatMode = document.getElementById('repeat-mode');
    const dueTime = document.getElementById('due-time'); // Get due time element
    const subtasksList = document.getElementById('subtasks-list');

    taskDetailText.textContent = taskText; // Set task details text
    taskNotes.value = taskItem.dataset.notes || ""; // Load notes from data attribute
    reminderTime.value = taskItem.dataset.reminderTime || ""; // Load reminder time
    repeatMode.value = taskItem.dataset.repeatMode || "none"; // Load repeat mode
    dueTime.value = taskItem.dataset.dueTime || ""; // Load due time
    subtasksList.innerHTML = taskItem.dataset.subtasks ? JSON.parse(taskItem.dataset.subtasks).map(subtask => `<li>${subtask}</li>`).join('') : "";

    currentTaskItem = taskItem; // Store the reference to the current task item

    deleteButton.onclick = () => showConfirmationDialog(currentTaskItem); // Show confirmation dialog
    taskDetailPanel.classList.add('open'); // Show task detail panel
}

// Event listener for adding a new sub-task
document.getElementById('new-subtask').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const subtaskText = event.target.value.trim();
        if (subtaskText !== "") {
            const subtasksList = document.getElementById('subtasks-list');
            const subtaskItem = document.createElement('li');
            subtaskItem.textContent = subtaskText;
            subtasksList.appendChild(subtaskItem);
            event.target.value = '';
            saveTaskDetails(); // Save task details to local storage
        }
    }
});

// Function to load tasks from local storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskList = document.getElementById('task-list');
    
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        taskItem.classList.toggle('completed', task.completed);
        taskItem.innerHTML = `
            <span>${task.text}</span>
            <div>
                <input type="radio" class="completion-radio" ${task.completed ? 'checked' : ''} />
            </div>
        `;
        taskItem.dataset.notes = task.notes || "";
        taskItem.dataset.reminderTime = task.reminderTime || "";
        taskItem.dataset.repeatMode = task.repeatMode || "none";
        taskItem.dataset.subtasks = JSON.stringify(task.subtasks || []);

        taskItem.addEventListener('click', () => showTaskDetail(task.text, taskItem));
        taskItem.querySelector('.completion-radio').addEventListener('click', (event) => {
            event.stopPropagation();
            markAsCompleted(taskItem);
        });
        taskList.appendChild(taskItem);
    });
}

// Function to save tasks to local storage
function saveTasks() {
    const taskList = document.getElementById('task-list');
    const tasks = Array.from(taskList.children).map(taskItem => ({
        text: taskItem.querySelector('span').textContent,
        completed: taskItem.classList.contains('completed'),
        notes: taskItem.dataset.notes || "",
        reminderTime: taskItem.dataset.reminderTime || "",
        repeatMode: taskItem.dataset.repeatMode || "none",
        subtasks: JSON.parse(taskItem.dataset.subtasks || "[]")
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event listener to save task details when closing the task details panel
document.getElementById('close-detail-btn').addEventListener('click', () => {
    saveTaskDetails(); // Save the current task details
    closeTaskDetail(); // Close the task details panel
});

// Event listeners for opening and closing the side panel
document.getElementById('open-panel-btn').addEventListener('click', toggleSidePanel);
document.getElementById('close-panel-btn').addEventListener('click', toggleSidePanel);

// Event listener for adding a task when the Enter key is pressed
document.getElementById('new-task').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Function to close task details panel
function closeTaskDetail() {
    const taskDetailPanel = document.getElementById('task-detail-panel');
    taskDetailPanel.classList.remove('open');
}

// Load tasks and show cookie consent alert when the page loads
window.addEventListener('load', () => {
    loadTasks();
    showCookieConsent(); // Show cookie consent alert
});
