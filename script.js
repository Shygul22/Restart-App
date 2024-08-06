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
        // You can set cookies or initialize any cookie-related functionality here
    } else {
        localStorage.setItem('cookieConsent', 'no');
        // Handle the scenario when cookies are declined (e.g., disable cookie-related features)
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
    if (taskItem.classList.contains('completed')) {
        radioButton.checked = true;
    } else {
        radioButton.checked = false;
    }

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
        saveTasks(); // Save tasks to local storage
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

    taskDetailText.textContent = taskText; // Set task details text
    currentTaskItem = taskItem; // Store the reference to the current task item
    deleteButton.onclick = () => showConfirmationDialog(currentTaskItem); // Show confirmation dialog
    taskDetailPanel.classList.add('open'); // Show task detail panel
}

// Function to close task details panel
function closeTaskDetail() {
    const taskDetailPanel = document.getElementById('task-detail-panel');
    taskDetailPanel.classList.remove('open');
}

// Function to save tasks to local storage
function saveTasks() {
    const taskList = document.getElementById('task-list');
    const tasks = Array.from(taskList.children).map(taskItem => ({
        text: taskItem.querySelector('span').textContent,
        completed: taskItem.classList.contains('completed')
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

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
        taskItem.addEventListener('click', () => showTaskDetail(task.text, taskItem));
        taskItem.querySelector('.completion-radio').addEventListener('click', (event) => {
            event.stopPropagation();
            markAsCompleted(taskItem);
        });
        taskList.appendChild(taskItem);
    });
}

// Event listeners for opening and closing the side panel
document.getElementById('open-panel-btn').addEventListener('click', toggleSidePanel);
document.getElementById('close-panel-btn').addEventListener('click', toggleSidePanel);
document.getElementById('close-detail-btn').addEventListener('click', closeTaskDetail);

// Event listener for adding a task when the Enter key is pressed
document.getElementById('new-task').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Load tasks and show cookie consent alert when the page loads
window.addEventListener('load', () => {
    loadTasks();
    showCookieConsent(); // Show cookie consent alert
});
