// Загружаем задачи и отображаем их
function loadTasks() {
  chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || {};
      const tasksContainer = document.getElementById('tasks-container');
      const noTasksMessage = document.getElementById('no-tasks-message');
      const deleteSelectedButton = document.getElementById('delete-selected');
      const template = document.getElementById('task-template');

      tasksContainer.innerHTML = ''; // Очищаем контейнер

      if (Object.keys(tasks).length === 0) {
          // Если задач нет, показываем сообщение
          noTasksMessage.classList.remove('hidden');
          deleteSelectedButton.classList.add('hidden');
      } else {
          noTasksMessage.classList.add('hidden');
          deleteSelectedButton.classList.remove('hidden');
      }

      Object.entries(tasks).forEach(([tabId, task]) => {
          chrome.tabs.get(parseInt(tabId), (tab) => {
              const tabName = tab ? tab.title : `Вкладка ID: ${tabId}`;

              // Клонируем шаблон
              const taskCard = template.content.cloneNode(true);
              taskCard.querySelector('.task-title').textContent = tabName;
              taskCard.querySelector('.task-desc').textContent = task;

              // Сохраняем ID вкладки в атрибуте чекбокса
              const checkbox = taskCard.querySelector('.task-select');
              checkbox.dataset.tabId = tabId;

              tasksContainer.appendChild(taskCard);
          });
      });
  });
}

// Удаление выбранных задач
function deleteSelectedTasks() {
  chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || {};
      const checkboxes = document.querySelectorAll('.task-select:checked');

      checkboxes.forEach((checkbox) => {
          const tabId = checkbox.dataset.tabId;
          delete tasks[tabId];
      });

      chrome.storage.local.set({ tasks }, () => {
          loadTasks(); // Перезагружаем задачи
      });
  });
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
  const deleteSelectedButton = document.getElementById('delete-selected');

  // Загружаем задачи
  loadTasks();

  // Удаляем выбранные задачи
  deleteSelectedButton.addEventListener('click', deleteSelectedTasks);
});
