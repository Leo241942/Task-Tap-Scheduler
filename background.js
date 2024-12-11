let tasks = {};

// Слушаем события переключения вкладок
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;

  // Получаем текущую вкладку
  chrome.tabs.get(tabId, (tab) => {
    const tabTitle = tab.title; // Название вкладки
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks || {};
      const task = tasks[tabId];
      if (task) {
        // Отправляем уведомление с названием вкладки
        chrome.notifications.create(`task_${tabId}`, {
          type: "basic",
          iconUrl: "icon128.png",
          title: "Закрепленная задача",
          message: `Вкладка: "${tabTitle}"\nЗадача: ${task}`,
          priority: 2,
        });
      }
    });
  });
});

// Обработчик для сохранения, получения и удаления задач
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveTask") {
    const { tabId, task } = message;
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks || {};
      tasks[tabId] = task;
      chrome.storage.local.set({ tasks }, () => {
        sendResponse({ status: "saved" });
      });
    });
    return true;
  } else if (message.type === "getTasks") {
    chrome.storage.local.get(["tasks"], (result) => {
      sendResponse(result.tasks || {});
    });
    return true;
  } else if (message.type === "deleteTask") {
    const { tabId } = message;
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks || {};
      delete tasks[tabId];
      chrome.storage.local.set({ tasks }, () => {
        sendResponse({ status: "deleted" });
      });
    });
    return true;
  }
});
