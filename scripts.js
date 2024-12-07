let numIncompleteCount = 0;
let numCompleteCount = 0;
let timer;

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const incompleteList = document.getElementById("incomplete-list");
const incompleteCount = document.getElementById("incomplete-count");
const completeList = document.getElementById("complete-list");
const completeCount = document.getElementById("complete-count");
let selectedTaskDom = null;

const titleNotes = document.getElementById("title-notes");
const textNotes = document.getElementById("text-notes");
const checkboxNotes = document.getElementById("checkbox-notes");
const dateNotes = document.getElementById("date-notes");
const detailNotes = document.getElementById("detail-notes")

// Load data if it's already there
window.addEventListener('DOMContentLoaded', () => {
  const todoIncompleteList = JSON.parse(localStorage.getItem('incompleteList')) || [];
  const todoCompleteList = JSON.parse(localStorage.getItem('completeList')) || [];
  todoIncompleteList.forEach(taskText => addTodoToDom(taskText, incompleteList, incompleteCount));
  todoCompleteList.forEach(taskText => addTodoToDom(taskText, completeList, completeCount));

  const selectedTask = localStorage.getItem("selectedTask");
  if (selectedTask != null) {
    selectedTaskDom = findLiFromTitle(selectedTask);
    selectedTaskDom.classList.add("selected");

    addNotesToRightSide(selectedTask);
  } else {
    textNotes.style.display = "none";
    detailNotes.style.display = "flex";
  }
});

window.addEventListener('beforeunload', () => {
  if (selectedTaskDom == null) return;

  const selectedTask = selectedTaskDom.querySelector('p').textContent;
  setNoteToLocalStorage(selectedTask, textNotes.value, null);
});

todoForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from refreshing the page
    
    const taskText = todoInput.value;
    todoInput.value = "";

    if (taskText === "") {
      return;
    } else if (checkDuplicateTask(taskText)) {
      alert("Duplicate notes title aren't allowed");
      return;
    } else if (taskText === "completeList" || taskText === "incompleteList" || taskText === "selectedTask") {
      alert(taskText + " is a reversed word for this application");
      return;
    }
  
    addTodoToDom(taskText, incompleteList, incompleteCount);
    addTaskToLocalStorage(taskText, incompleteList);
    addNoteToLocalStorage(taskText);
});

textNotes.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const selectedTask = selectedTaskDom.querySelector('p').textContent;
    setNoteToLocalStorage(selectedTask, textNotes.value, null);
  }, 500); // Save after 500ms of inactivity
});

checkboxNotes.addEventListener("change", function() {
  moveTask(this, localStorage.getItem("selectedTask"));
});

function findLiFromTitle(title) {
  const listItems = document.querySelectorAll('li');
  return Array.from(listItems).find((li) => {
    const paragraph = li.querySelector('p');
    if (paragraph && paragraph.textContent.trim() === title) return this;
  });
}

function checkDuplicateTask(taskText) {
  const allTasks = document.querySelectorAll("li");
  for (const task of allTasks) {
    const paragraph = task.querySelector('p');
    if (paragraph && paragraph.textContent.trim() === taskText) return true;
  }

  return false;
};

function addNotesToRightSide(title) {
  titleNotes.textContent = title;
  const object = JSON.parse(localStorage.getItem(title));
  checkboxNotes.checked = object.checked;
  dateNotes.textContent = "Date created: " + object.date;
  if (object.note != null) textNotes.value = object.note;
  else textNotes.value = "";
};

function clearNotes() {
  titleNotes.textContent = "";
  textNotes.value = "";
}
  
function addTodoToDom(taskText, list, count) {
  const taskItem = document.createElement("li");
  taskItem.addEventListener("click", function() {
    selectTask(this);
  });

  const checkBoxAndText = document.createElement("div");
  checkBoxAndText.classList.add("row");

  // add complete checkbox
  const checkBox = document.createElement("input");
  checkBox.type = "checkbox";
  if (list == completeList) checkBox.checked = true;
  checkBox.addEventListener("change", function() {
    moveTask(this, taskText);
  });
  checkBoxAndText.appendChild(checkBox);

  // add task text
  const text = document.createElement("p");
  text.textContent = taskText;
  checkBoxAndText.appendChild(text);
  taskItem.appendChild(checkBoxAndText);

  // add delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-btn");
  deleteButton.addEventListener("click", function(event) { // when delete button is pressed
    event.stopPropagation();
    deleteTask(this, taskText, taskItem);
  });
  taskItem.appendChild(deleteButton);

  list.appendChild(taskItem);
  if (list == incompleteList) count.textContent = ++numIncompleteCount;
  else count.textContent = ++numCompleteCount;
}

// when tasks are clicked
function selectTask(task) {
  if (selectedTaskDom != null) selectedTaskDom.classList.remove("selected");
  task.classList.add("selected");
  selectedTaskDom = task;
  const selectedTask = selectedTaskDom.querySelector('p').textContent;
  addNotesToRightSide(selectedTask);
  localStorage.setItem("selectedTask", selectedTask);
  textNotes.style.display = "block";
  detailNotes.style.display = "flex";
};

// when tasks are complete/incomplete
function moveTask(checkBox, taskText) {
  const li = findLiFromTitle(taskText);

  if (checkBox.checked) {
    removeTaskFromLocalStorage(taskText, incompleteList);
    addTaskToLocalStorage(taskText, completeList);
    completeList.appendChild(li);
    li.querySelector('input[type="checkbox"]').checked = true;
    incompleteCount.textContent = --numIncompleteCount;
    completeCount.textContent = ++numCompleteCount;
  } else {
    removeTaskFromLocalStorage(taskText, completeList);
    addTaskToLocalStorage(taskText, incompleteList);
    incompleteList.appendChild(li);
    li.querySelector('input[type="checkbox"]').checked = false;
    completeCount.textContent = --numCompleteCount;
    incompleteCount.textContent = ++numIncompleteCount;
  }

  setNoteToLocalStorage(taskText, null, checkBox.checked);
  addNotesToRightSide(taskText);
}

// when task is deleted
function deleteTask(deleteButton, taskText, taskItem) {
  const grandparent = deleteButton.parentElement.parentElement;
  if (grandparent && grandparent.id === "incomplete-list") {
    removeTaskFromLocalStorage(taskText, incompleteList);
    incompleteCount.textContent = --numIncompleteCount;
  } else if (grandparent && grandparent.id === "complete-list") {
    removeTaskFromLocalStorage(taskText, completeList);
    completeCount.textContent = --numCompleteCount;
  }
  taskItem.remove();
  if (taskText == localStorage.getItem("selectedTask")) {
    localStorage.removeItem("selectedTask");
  }
  removeNoteFromLocalStorage(taskText);
  clearNotes()
  textNotes.style.display = "none";
  detailNotes.style.display = "none";
}

function addTaskToLocalStorage(taskText, list) {
  let listName = list == incompleteList ? "incompleteList" : "completeList";
  let storedTodos = JSON.parse(localStorage.getItem(listName)) || [];
  storedTodos.push(taskText);
  localStorage.setItem(listName, JSON.stringify(storedTodos));
};

function removeTaskFromLocalStorage(taskText, list) {
  let listName = list == incompleteList ? "incompleteList" : "completeList";
  let storedTodos = JSON.parse(localStorage.getItem(listName)) || [];
  storedTodos = storedTodos.filter(item => item !== taskText);
  localStorage.setItem(listName, JSON.stringify(storedTodos));
};

function addNoteToLocalStorage(taskText) {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'}).replace(",", "");
  const object = { title: taskText, note: "", date: dateString, checked: false};
  localStorage.setItem(taskText.trim(), JSON.stringify(object));
}

function setNoteToLocalStorage(taskText, note, checked)  {
  if (note != null) {
    note = note.trim()
    if (note.length === 0) {
      removeNoteFromLocalStorage(taskText);
      return;
    }
  }

  const object = JSON.parse(localStorage.getItem(taskText));
  if (object == null) addNoteToLocalStorage(taskText);
  if (note != null) object.note = note;
  if (checked != null) object.checked = checked;
  localStorage.setItem(taskText, JSON.stringify(object));
};

function removeNoteFromLocalStorage(taskText) {
  localStorage.removeItem(taskText);
}

function updateDateTime() {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'}).replace(",", "");
  const timeString = currentDate.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true});
  document.getElementById("date-time").innerHTML = `${dateString}<br>${timeString}`;
}

updateDateTime();
setInterval(updateDateTime, 1000);