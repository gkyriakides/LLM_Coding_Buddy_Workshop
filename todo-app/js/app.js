/**
 * Task Manager - A vanilla JavaScript To-Do application
 * Features:
 * - Add, edit, delete tasks
 * - Set deadlines and priorities
 * - Filter and search tasks
 * - Mark tasks as complete
 * - Local storage persistence
 */

// DOM Elements
const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');
const searchInput = document.getElementById('search-tasks');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeModalBtn = document.querySelector('.close-modal');

// Task Template
const taskTemplate = document.getElementById('task-template');

// Global Variables
let tasks = [];
let currentEditId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
    setupEventListeners();
});

/**
 * Load tasks from local storage
 */
function loadTasksFromStorage() {
    try {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    } catch (error) {
        console.error('Error loading tasks from storage:', error);
        tasks = [];
    }
}

/**
 * Save tasks to local storage
 */
function saveTasksToStorage() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to storage:', error);
        showNotification('Error saving tasks', 'error');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Form submission for adding a new task
    taskForm.addEventListener('submit', handleAddTask);
    
    // Edit form submission
    editForm.addEventListener('submit', handleUpdateTask);
    
    // Close modal
    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Search and filter
    searchInput.addEventListener('input', filterTasks);
    filterPriority.addEventListener('change', filterTasks);
    filterStatus.addEventListener('change', filterTasks);
}

/**
 * Handle adding a new task
 * @param {Event} e - Form submit event
 */
function handleAddTask(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const deadlineInput = document.getElementById('task-deadline');
    const priorityInput = document.getElementById('task-priority');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const deadline = deadlineInput.value;
    const priority = priorityInput.value;
    
    if (!title) {
        showNotification('Task title is required', 'error');
        return;
    }
    
    // Create a new task object
    const newTask = {
        id: Date.now().toString(),
        title,
        description,
        deadline,
        priority,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.unshift(newTask);
    
    // Save to storage
    saveTasksToStorage();
    
    // Clear the form
    taskForm.reset();
    
    // Render tasks
    renderTasks();
    
    showNotification('Task added successfully');
}

/**
 * Handle updating an existing task
 * @param {Event} e - Form submit event
 */
function handleUpdateTask(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('edit-title');
    const descriptionInput = document.getElementById('edit-description');
    const deadlineInput = document.getElementById('edit-deadline');
    const priorityInput = document.getElementById('edit-priority');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const deadline = deadlineInput.value;
    const priority = priorityInput.value;
    
    if (!title) {
        showNotification('Task title is required', 'error');
        return;
    }
    
    // Find task index
    const taskIndex = tasks.findIndex(task => task.id === currentEditId);
    
    if (taskIndex === -1) {
        showNotification('Task not found', 'error');
        return;
    }
    
    // Update task
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        deadline,
        priority,
        updatedAt: new Date().toISOString()
    };
    
    // Save to storage
    saveTasksToStorage();
    
    // Close modal
    editModal.style.display = 'none';
    
    // Render tasks
    renderTasks();
    
    showNotification('Task updated successfully');
}

/**
 * Open the edit modal for a task
 * @param {string} taskId - ID of the task to edit
 */
function openEditModal(taskId) {
    const task = tasks.find(task => task.id === taskId);
    
    if (!task) {
        showNotification('Task not found', 'error');
        return;
    }
    
    // Set current edit ID
    currentEditId = taskId;
    
    // Fill the form
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-description').value = task.description || '';
    document.getElementById('edit-deadline').value = task.deadline || '';
    document.getElementById('edit-priority').value = task.priority;
    
    // Show modal
    editModal.style.display = 'block';
}

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 */
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToStorage();
        renderTasks();
        showNotification('Task deleted successfully');
    }
}

/**
 * Toggle task completion status
 * @param {string} taskId - ID of the task to toggle
 */
function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        showNotification('Task not found', 'error');
        return;
    }
    
    // Toggle status
    const newStatus = tasks[taskIndex].status === 'completed' ? 'pending' : 'completed';
    
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
    };
    
    // Save to storage
    saveTasksToStorage();
    
    // Render tasks
    renderTasks();
    
    showNotification(`Task marked as ${newStatus}`);
}

/**
 * Filter tasks based on search input and filter selections
 */
function filterTasks() {
    renderTasks();
}

/**
 * Render tasks to the DOM
 */
function renderTasks() {
    // Clear the list
    tasksList.innerHTML = '';
    
    // Get filter values
    const searchTerm = searchInput.value.toLowerCase();
    const priorityFilter = filterPriority.value;
    const statusFilter = filterStatus.value;
    
    // Filter tasks
    let filteredTasks = tasks.filter(task => {
        // Search term filter
        const matchesSearch = 
            task.title.toLowerCase().includes(searchTerm) || 
            (task.description && task.description.toLowerCase().includes(searchTerm));
        
        // Priority filter
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        
        return matchesSearch && matchesPriority && matchesStatus;
    });
    
    // Show message if no tasks
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No tasks found. Add a new task to get started!';
        emptyMessage.classList.add('empty-message');
        tasksList.appendChild(emptyMessage);
        return;
    }
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

/**
 * Create a DOM element for a task
 * @param {Object} task - The task object
 * @returns {HTMLElement} The task DOM element
 */
function createTaskElement(task) {
    // Clone the template
    const taskElement = document.importNode(taskTemplate.content, true).querySelector('.task-item');
    
    // Set task ID
    taskElement.dataset.id = task.id;
    
    // Set task details
    taskElement.querySelector('.task-title').textContent = task.title;
    taskElement.querySelector('.task-description').textContent = task.description || 'No description';
    
    // Set priority
    const priorityElement = taskElement.querySelector('.task-priority');
    priorityElement.textContent = `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`;
    priorityElement.classList.add(task.priority);
    
    // Set deadline
    const deadlineElement = taskElement.querySelector('.task-deadline');
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const isOverdue = deadlineDate < new Date() && task.status !== 'completed';
        
        deadlineElement.textContent = `Due: ${formatDate(deadlineDate)}`;
        
        if (isOverdue) {
            deadlineElement.classList.add('overdue');
            taskElement.classList.add('overdue');
        }
    } else {
        deadlineElement.textContent = 'No deadline';
    }
    
    // Set task status
    if (task.status === 'completed') {
        taskElement.classList.add('completed');
    } else {
        taskElement.classList.add('pending');
    }
    
    // Add event listeners to buttons
    const completeBtn = taskElement.querySelector('.complete-btn');
    const editBtn = taskElement.querySelector('.edit-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => toggleTaskCompletion(task.id));
    editBtn.addEventListener('click', () => openEditModal(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return taskElement;
}

/**
 * Format a date for display
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Show a notification message
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (success or error)
 */
function showNotification(message, type = 'success') {
    // Check if a notification already exists and remove it
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Check for overdue tasks and update their status
 */
function checkOverdueTasks() {
    const now = new Date();
    
    let hasChanges = false;
    
    tasks.forEach(task => {
        if (task.deadline && task.status !== 'completed') {
            const deadlineDate = new Date(task.deadline);
            
            if (deadlineDate < now && !task.isOverdue) {
                task.isOverdue = true;
                hasChanges = true;
            }
        }
    });
    
    if (hasChanges) {
        saveTasksToStorage();
        renderTasks();
    }
}

// Check for overdue tasks every minute
setInterval(checkOverdueTasks, 60000);

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.notification {
    position: fixed;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--success-color);
    color: white;
    padding: 1rem 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    transition: bottom 0.3s ease-in-out;
    z-index: 1001;
}

.notification.error {
    background-color: var(--danger-color);
}

.notification.show {
    bottom: 20px;
}

.empty-message {
    text-align: center;
    color: #777;
    margin: 2rem 0;
}

.task-deadline.overdue {
    color: var(--danger-color);
    font-weight: bold;
}
`;
document.head.appendChild(notificationStyles); 