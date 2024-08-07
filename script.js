// Function to show 

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
            showNotification('Reminder', { body: task.text, icon: 'path/to/icon.png' });
            task.reminderNotified = true; // Mark as notified
        }

        if (dueTime && now >= dueTime && !task.dueNotified) {
            showNotification('Due Date', { body: task.text, icon: 'path/to/icon.png' });
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
        currentTaskItem.dataset.notes = document.getElementById('task-notes').value;
        currentTaskItem.dataset.reminderTime = document.getElementById('reminder-time').value;
        currentTaskItem.dataset.repeatMode = document.getElementById('repeat-mode').value;
        currentTaskItem.dataset.dueTime = document.getElementById('due-time').value;
        currentTaskItem.dataset.subtasks = JSON.stringify(Array.from(document.getElementById('subtasks-list').children).map(subtask => subtask.textContent));

        // Mark notifications as not notified
        currentTaskItem.dataset.reminderNotified = 'false';
        currentTaskItem.dataset.dueNotified = 'false';

        saveTasks(); // Save tasks to local storage
    }
}

// Function to show the cookie consent alert
function showCookieConsent() {
    const consentBanner = document.getElementById('cookie-consent');
    if (!localStorage.getItem('cookieConsent')) {
        consentBanner.style.display = 'block';
    }
}

// Function to handle user response to the cookie consent
function handleCookieConsent(accepted) {
    const consentBanner = document.getElementById('cookie-consent');
    localStorage.setItem('cookieConsent', accepted ? 'yes' : 'no');
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
        taskItem.innerHTML = `<span>${taskText}</span><div><input type="radio" class="completion-radio" /></div>`;
        taskItem.addEventListener('click', () => showTaskDetail(taskText, taskItem));
        taskItem.querySelector('.completion-radio').addEventListener('click', (event) => {
            event.stopPropagation();
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
    taskItem.querySelector('.completion-radio').checked = taskItem.classList.contains('completed');
    saveTasks(); // Save tasks to local storage
}

// Function to show confirmation dialog
function showConfirmationDialog(taskItem) {
    const confirmationDialog = document.getElementById('confirmation-dialog');
    confirmationDialog.style.display = 'flex'; // Show the dialog

    document.getElementById('confirm-btn').onclick = () => {
        deleteTask(taskItem); // Proceed with deletion
        confirmationDialog.style.display = 'none'; // Hide the dialog
    };

    document.getElementById('cancel-btn').onclick = () => {
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
    document.getElementById('side-panel').classList.toggle('open');
}

// Function to show task details
let currentTaskItem = null; // Global variable to store the current task item

function showTaskDetail(taskText, taskItem) {
    const taskDetailPanel = document.getElementById('task-detail-panel');
    document.getElementById('task-detail-text').textContent = taskText;
    document.getElementById('task-notes').value = taskItem.dataset.notes || "";
    document.getElementById('reminder-time').value = taskItem.dataset.reminderTime || "";
    document.getElementById('repeat-mode').value = taskItem.dataset.repeatMode || "none";
    document.getElementById('due-time').value = taskItem.dataset.dueTime || "";
    document.getElementById('subtasks-list').innerHTML = taskItem.dataset.subtasks ? JSON.parse(taskItem.dataset.subtasks).map(subtask => `<li>${subtask}</li>`).join('') : "";

    currentTaskItem = taskItem; // Store the reference to the current task item

    document.getElementById('delete-task-btn').onclick = () => showConfirmationDialog(currentTaskItem); // Show confirmation dialog
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
    taskList.innerHTML = ''; // Clear the task list before loading

    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        taskItem.classList.toggle('completed', task.completed);
        taskItem.innerHTML = `<span>${task.text}</span><div><input type="radio" class="completion-radio" ${task.completed ? 'checked' : ''} /></div>`;
        taskItem.dataset.notes = task.notes || "";
        taskItem.dataset.reminderTime = task.reminderTime || "";
        taskItem.dataset.repeatMode = task.repeatMode || "none";
        taskItem.dataset.subtasks = JSON.stringify(task.subtasks || []);
        taskItem.dataset.reminderNotified = task.reminderNotified || "false";
        taskItem.dataset.dueNotified = task.dueNotified || "false";
        taskItem.dataset.dueTime = task.dueTime || "";

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
        subtasks: JSON.parse(taskItem.dataset.subtasks || "[]"),
        reminderNotified: taskItem.dataset.reminderNotified || "false",
        dueNotified: taskItem.dataset.dueNotified || "false",
        dueTime: taskItem.dataset.dueTime || ""
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event listener to save task details when closing the task details panel
document.getElementById('close-detail-btn').addEventListener('click', () => {
    saveTaskDetails(); // Save task details to local storage
    document.getElementById('task-detail-panel').classList.remove('open'); // Close the task details panel
});

// Load tasks when the page is loaded
window.addEventListener('load', () => {
    loadTasks();
    showCookieConsent();
});
