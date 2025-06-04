// Toggle task completion
document.addEventListener('DOMContentLoaded', function() {
  const taskList = document.getElementById('task-list');
  
  taskList.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
      const taskText = e.target.nextElementSibling.nextElementSibling;
      if (e.target.checked) {
        taskText.classList.add('completed');
      } else {
        taskText.classList.remove('completed');
      }
    }
  });
});

// Modal functions
function openTaskModal() {
  document.getElementById('taskModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('taskModal').style.display = 'none';
}

// Add new task
function addTask() {
  const taskInput = document.getElementById('taskInput');
  const dueDate = document.getElementById('dueDate');
  const taskText = taskInput.value.trim();
  
  if (taskText) {
    const list = document.getElementById('task-list');
    const li = document.createElement('li');
    li.className = 'task-item';
    
    let dueDateText = 'Today';
    let dueDateIcon = '<i class="far fa-calendar-alt"></i>';
    
    switch(dueDate.value) {
      case 'tomorrow':
        dueDateText = 'Tomorrow';
        break;
      case 'later':
        dueDateText = 'Later';
        dueDateIcon = '<i class="far fa-calendar"></i>';
        break;
    }
    
    li.innerHTML = `
      <label class="task-checkbox">
        <input type="checkbox">
        <span class="checkmark"></span>
        <span class="task-text">${taskText}</span>
      </label>
      <span class="task-due">${dueDateIcon} ${dueDateText}</span>
    `;
    
    list.appendChild(li);
    taskInput.value = '';
    closeModal();
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('taskModal');
  if (event.target === modal) {
    closeModal();
  }
}