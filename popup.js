document.addEventListener("DOMContentLoaded", () => 
{
  const taskInput = document.getElementById("task-input");
  const addTaskButton = document.getElementById("add-task");
  const taskPageButton = document.getElementById("task-page-btn");
  const taskCount = document.getElementById("task-count");

  // Функция для обновления счётчика задач
  const updateTaskCount = () => 
  {
    chrome.runtime.sendMessage({ type: "getTasks" }, (tasks) => 
    {
      const taskCountNumber = Object.keys(tasks || {}).length;
      taskCount.textContent = `${taskCountNumber} ${getTaskWord(taskCountNumber)}`;
    });
  };

  // Определение слова для задач
  const getTaskWord = (count) => 
  {
    if (count % 10 === 1 && count % 100 !== 11) return "задача";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "задачи";
    return "задач";
  };

  // Сохранение задачи для текущей вкладки
  addTaskButton.addEventListener("click", () => 
  {
    const task = taskInput.value.trim();
    if (!task) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.runtime.sendMessage({ type: "saveTask", tabId, task }, (response) => {
        if (response.status === "saved") {
          taskInput.value = ""; // Очистить поле ввода
          updateTaskCount(); // Обновить счётчик
        }
      });
    });
  });

  // Переход к странице задач
  taskPageButton.addEventListener("click", () => 
  {
    chrome.tabs.create({ url: "pages/tasks.html" });
  });

  // Первоначальное обновление счётчика задач
  updateTaskCount();
});
