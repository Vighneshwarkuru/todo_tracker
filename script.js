// App State
let state = {
  username: '',
  tasks: [],
  friends: [],
  activities: []
};

// DOM Elements
const elements = {
  taskList: document.getElementById('task-list'),
  friendsList: document.getElementById('friends-list'),
  activityFeed: document.getElementById('activity-feed'),
  usernameDisplay: document.getElementById('username'),
  userModal: document.getElementById('userModal'),
  taskModal: document.getElementById('taskModal'),
  friendModal: document.getElementById('friendModal')
};

// Initialize the app
function init() {
  loadState();
  if (!state.username) {
    showUserModal();
  } else {
    renderAll();
  }
}

// Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem('taskTogetherState');
  if (savedState) {
    state = JSON.parse(savedState);
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('taskTogetherState', JSON.stringify(state));
}

// Render all components
function renderAll() {
  renderTasks();
  renderFriends();
  renderActivities();
  updateUsernameDisplay();
}

// Set username
function setUsername() {
  const userInput = document.getElementById('userInput');
  if (userInput.value.trim()) {
    state.username = userInput.value.trim();
    saveState();
    closeModal();
    renderAll();
    addActivity(`${state.username} joined TaskTogether`);
  }
}

// Show username modal
function showUserModal() {
  elements.userModal.style.display = 'flex';
}

// Task functions
function openTaskModal() {
  document.getElementById('taskInput').value = '';
  document.getElementById('dueDate').value = 'today';
  elements.taskModal.style.display = 'flex';
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const dueDate = document.getElementById('dueDate');
  const taskText = taskInput.value.trim();
  
  if (taskText) {
    const newTask = {
      id: Date.now(),
      text: taskText,
      due: dueDate.value,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    state.tasks.push(newTask);
    saveState();
    renderTasks();
    closeModal();
    addActivity(`${state.username} added task: "${taskText}"`);
  }
}

function renderTasks() {
  elements.taskList.innerHTML = '';
  
  state.tasks.sort((a, b) => {
    // Sort by completion status (incomplete first)
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Then by due date
    const dueOrder = { 'today': 1, 'tomorrow': 2, 'week': 3, 'later': 4 };
    return dueOrder[a.due] - dueOrder[b.due];
  });
  
  state.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    
    let dueDateText = 'Today';
    let dueDateIcon = '<i class="far fa-calendar-alt"></i>';
    
    switch(task.due) {
      case 'tomorrow':
        dueDateText = 'Tomorrow';
        break;
      case 'week':
        dueDateText = 'This Week';
        dueDateIcon = '<i class="far fa-calendar-week"></i>';
        break;
      case 'later':
        dueDateText = 'Later';
        dueDateIcon = '<i class="far fa-calendar"></i>';
        break;
    }
    
    li.innerHTML = `
      <label class="task-checkbox">
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="checkmark"></span>
        <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
      </label>
      <div class="task-details">
        <span class="task-due">${dueDateIcon} ${dueDateText}</span>
        <div class="task-actions">
          <button onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    
    elements.taskList.appendChild(li);
  });
  
  // Add event listeners for checkboxes
  document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const taskId = parseInt(this.closest('.task-item').dataset.id);
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = this.checked;
        saveState();
        renderTasks();
        const status = task.completed ? 'completed' : 'marked incomplete';
        addActivity(`${state.username} ${status} task: "${task.text}"`);
      }
    });
  });
}

function deleteTask(id) {
  const taskIndex = state.tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    const [deletedTask] = state.tasks.splice(taskIndex, 1);
    saveState();
    renderTasks();
    addActivity(`${state.username} deleted task: "${deletedTask.text}"`);
  }
}

function clearCompletedTasks() {
  const completedTasks = state.tasks.filter(t => t.completed);
  if (completedTasks.length === 0) return;
  
  state.tasks = state.tasks.filter(t => !t.completed);
  saveState();
  renderTasks();
  addActivity(`${state.username} cleared ${completedTasks.length} completed tasks`);
}

// Friend functions
function openFriendModal() {
  document.getElementById('friendName').value = '';
  document.getElementById('avatar1').checked = true;
  elements.friendModal.style.display = 'flex';
}

function addFriend() {
  const friendName = document.getElementById('friendName').value.trim();
  const avatar = document.querySelector('input[name="avatar"]:checked').value;
  
  if (friendName) {
    const newFriend = {
      id: Date.now(),
      name: friendName,
      avatar: avatar,
      joinedAt: new Date().toISOString(),
      tasksCompleted: Math.floor(Math.random() * 5) // Random for demo
    };
    
    state.friends.push(newFriend);
    saveState();
    renderFriends();
    closeModal();
    addActivity(`${state.username} added friend: ${friendName}`);
  }
}

function renderFriends() {
  elements.friendsList.innerHTML = '';
  
  state.friends.forEach(friend => {
    const li = document.createElement('li');
    li.className = 'friend-item';
    li.dataset.id = friend.id;
    
    li.innerHTML = `
      <div class="friend-info">
        <span class="friend-avatar">${friend.avatar}</span>
        <span class="friend-name">${friend.name}</span>
      </div>
      <span class="task-count"><i class="fas fa-check-circle"></i> ${friend.tasksCompleted} tasks today</span>
    `;
    
    elements.friendsList.appendChild(li);
  });
}

// Activity functions
function addActivity(text) {
  const newActivity = {
    id: Date.now(),
    text: text,
    timestamp: new Date().toISOString(),
    timeAgo: 'just now'
  };
  
  state.activities.unshift(newActivity);
  if (state.activities.length > 10) {
    state.activities.pop();
  }
  saveState();
  renderActivities();
}

function renderActivities() {
  elements.activityFeed.innerHTML = '';
  
  state.activities.forEach(activity => {
    const li = document.createElement('li');
    li.className = 'activity-item';
    
    // Calculate time ago
    const now = new Date();
    const activityDate = new Date(activity.timestamp);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    let timeAgo;
    if (diffInMinutes < 1) timeAgo = 'just now';
    else if (diffInMinutes < 60) timeAgo = `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      timeAgo = `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      timeAgo = `${days} day${days === 1 ? '' : 's'} ago`;
    }
    
    li.innerHTML = `
      <div class="activity-content">
        <span class="activity-avatar">👤</span>
        <div>
          <p class="activity-text">${activity.text}</p>
          <p class="activity-time"><i class="far fa-clock"></i> ${timeAgo}</p>
        </div>
      </div>
    `;
    
    elements.activityFeed.appendChild(li);
  });
}

// Modal functions
function closeModal() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

function updateUsernameDisplay() {
  elements.usernameDisplay.textContent = state.username;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    closeModal();
  }
};