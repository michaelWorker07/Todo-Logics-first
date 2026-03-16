function changeColor(color) {
    document.body.style.backgroundColor = color;
};

const modal = document.querySelector('.modalWindow');
const openModalBtn = document.querySelector('.ButtonCreate');
const closeBtn = document.querySelector('.closeBtn');
const overlay = document.querySelector('.overlay');
// Logics Todo
const saveBtn = document.querySelector('.saveBtn');
const inputField = document.querySelector('.inputNew');
const todoList = document.querySelector('.Todo-List');
const body = document.body;

// Counter Modal Tasks
const divCounterTaskModal = document.querySelector('.divCounterTaskModal');
const taskCountSpanAll = document.querySelector('.taskCountSpanAll');
const taskCountSpanActive = document.querySelector('.taskCountSpanActive')
const taskCountSpanCompleted = document.querySelector('.taskCountSpanCompleted');

// Modal => Buttons / ALL-Comp-Incomplete
const AllBtnModalThreeBtn = document.querySelector('.ButtonALL');
// =>
const TasksAllBtn = document.querySelector('.ButtonsAllTasks');
const TaskCompleteBtn = document.querySelector('.ButtonComplete');
const TasksInCompleteBtn = document.querySelector('.ButtonIncomplete');

// deleteAllTask
const deleteAllCheckbox = document.querySelector('.switchInput')

// UNDO Button

const UNDOButton = document.querySelector('.DeleteTask_WindowDeleteNow');

// Search TodoLi -- Name
let serverTodos = [];

let allTodosData = [];

let todosSearch = []; 
const inputSearch = document.querySelector('.fieldTodo');



inputSearch.addEventListener('input', () => { 
    const query = inputSearch.value.toLowerCase().trim();
    
    
    const filteredTasks = allTodosData.filter(todo => 
        todo.text.toLowerCase().includes(query)
    );

    renderTasks(filteredTasks); 
});

let countActiveTasks = 0;

function ActiveCount() {
    const allTasks = document.querySelectorAll('.listTodo');
    const totalCount = allTasks.length;
    const completedCount = Array.from(allTasks).filter(li => {
        const checkbox = li.querySelector('.checkboxInput');
        return checkbox && checkbox.checked;
    }).length;

    taskCountSpanAll.textContent = totalCount;
    taskCountSpanCompleted.textContent = completedCount;
    taskCountSpanActive.textContent = totalCount - completedCount;
}

let isSaving = false;

// Create Todo Function.
function createTask(taskText, saveTodos, isCompleted = false) {
    if (!taskText || taskText.trim() === "") {
        alert('Поле не может быть пустым! Уволен!'); 
        return null;
    }

    const li = document.createElement('li');
    li.onclick = () => console.log("Клик по всей строке тудушки!");
    li.className = 'listTodo';

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkboxInput';

    const span = document.createElement('span');
    span.textContent = taskText;
    span.className = 'SpanText';

    if (isCompleted) {
        checkbox.checked = true; 
        span.style.textDecoration = 'line-through'; 
    }
    

    checkbox.onchange = function() {
        const isChecked = this.checked;
        span.style.textDecoration = isChecked ? 'line-through' : 'none';

        fetch("http://localhost:3000/todos/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text: span.textContent, 
                completed: isChecked 
            })
        }).then(() => ActiveCount());
    };

        checkbox.addEventListener('change', function() {
            if (this.checked) {
                countActiveTasks++;
            } else {
                countActiveTasks--;
            }
            taskCountSpanCompleted.innerText = countActiveTasks;

            ActiveCount();
        });

if (saveTodos && !isSaving) { 
    isSaving = true; 

    fetch("http://localhost:3000/todos/add", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ text: taskText }) 
    })
    .then(res => res.json())
    .then(data => {
        console.log("Сохранено на сервере:", data);
        isSaving = false; 
    })
    .catch(err => {
        console.error("Ошибка:", err);
        isSaving = false; 
    });
    divCounterTaskModal.classList.add('show'); 
    ActiveCount(); 
}

    // deleteButton
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '';
    deleteBtn.className = 'deleteButton';
    deleteBtn.onclick = () => { 
    const taskText = span.textContent; 
    
    fetch("http://localhost:3000/todos/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: taskText }) 
    })
    .then(res => res.json())
    .then(data => console.log("Сервер ответил:", data.message))
    .catch(err => console.error("Ошибка при удалении:", err));
    const removedLi = li;
    li.remove();
    taskCountSpanAll.textContent = document.querySelectorAll('.listTodo').length;
    ActiveCount();

// Undo?Вернуть Button + окружность с таймером 
const UndoButton = document.createElement('button');
UndoButton.classList.add('RemoveTask_DeleteNow');
const seconds = 5; 
const radius = 12.5; 

const circumference = 2 * Math.PI * radius;

UndoButton.innerHTML = `
<svg width="24" height="24" viewBox="0 0 28 28" style="transform: rotate(-90deg); overflow: visible;">
    <circle cx="14" cy="14" r="${radius}" stroke="#ffffffff" stroke-width="3" fill="none"/> 
    <circle class="progress" cx="14" cy="14" r="${radius}"
            stroke="#6C63FF" stroke-width="5" stroke-linecap="round" fill="none" 
            style="stroke-dasharray: ${circumference}; 
                   stroke-dashoffset: 0; 
                   transition: stroke-dashoffset 0.1s linear;" /> 

    <text class="count" x="14" y="14" text-anchor="middle" dy=".3em" fill="white" font-size="14px" font-family="Arial" 
          style="transform: rotate(90deg); transform-origin: center;">${seconds}</text>
</svg>
<span class="btn-text">UNDO</span>`;

const progressCircle = UndoButton.querySelector('.progress');
const textNode = UndoButton.querySelector('.count');
let timeLeft = seconds;

console.log('circumference:', circumference);

const interval = setInterval(() => {
    timeLeft--;

    console.log('timeLeft:', timeLeft);

    if (timeLeft >= 0) {
        textNode.textContent = timeLeft;
        const offset = circumference * (1 - timeLeft / seconds);
        console.log('offset:', offset);
        progressCircle.style.strokeDashoffset = offset;
    }

    if (timeLeft <= 0) {
        clearInterval(interval);
        UndoButton.remove(); 
    }
}, 1000);

UndoButton.onclick = function() {
     console.log('UNDO Button попробует восстановить задачу...');
    
    if (typeof removedLi !== 'undefined') {
        document.querySelector('.Todo-List').appendChild(removedLi);
        taskCountSpanAll.textContent = document.querySelectorAll('.listTodo').length;
        if (typeof ActiveCount === 'function') ActiveCount();
    }

    clearInterval(interval);
    this.remove();
   };
document.body.appendChild(UndoButton);
};

    // EditBtn. => Редактирование кнопка внутри каждой таски
    const editButton = document.createElement('button')
    editButton.textContent = '';
    editButton.className = 'editButton';
    editButton.onclick = function(event) {
        editButton.disabled = true;

        const span = li.querySelector('span');
        const currentText = span.textContent;

        const editTodoInput = document.createElement('input');
        editTodoInput.value = currentText;
        editTodoInput.className = 'edit-input';

        li.replaceChild(editTodoInput, span);

        editTodoInput.onkeydown = (event) => {
            if (event.key === 'Enter') {
                const NewText = editTodoInput.value.trim();
                if (NewText) {

                    const NewTodoText = document.createElement('span');
                    NewTodoText.className = 'NewTodoText';
                    NewTodoText.textContent = NewText;

                    li.replaceChild(NewTodoText, editTodoInput);
                    editButton.disabled = false;

                    console.log("Задача изменена");
                }
            }
        }
    }   
    // Children and Parents
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    li.appendChild(editButton);

    if (saveTodos) {
 
    inputField.value = '';

    // Добавление счетчика с модалкой в дом на кнопку + (ALL TASKS) =>
    taskCountSpanAll.textContent = document.querySelectorAll('.listTodo').length;
    divCounterTaskModal.classList.add('show');
    ActiveCount();
    }
    return li;
}

// Фильтрация через Все - Вып. - Невып.  
function filterTasks(type) {
    const tasksSort = document.querySelectorAll('.listTodo');
    tasksSort.forEach(tasksSort => {
        const checkbox = tasksSort.querySelector('input[type="checkbox"]');
        const isCompleted = checkbox.checked;
        if (type === 'ALL') {
            tasksSort.style.display = 'flex';
        } else if (type === 'COMPLETED') {
            tasksSort.style.display = isCompleted ? 'flex' : 'none';
        } else if (type === 'INCOMPLETED') {
            tasksSort.style.display = !isCompleted ? 'flex' : 'none';
        }
    });
    TasksAllBtn.addEventListener('click', () => {
    filterTasks('ALL');
});

    TaskCompleteBtn.addEventListener('click', () => {
    filterTasks('COMPLETED');
});

    TasksInCompleteBtn.addEventListener('click', () => {
    filterTasks('INCOMPLETED');
});

    const AllButtonsSort = [TasksAllBtn, TaskCompleteBtn, TasksInCompleteBtn];
    AllButtonsSort.forEach(optText => {
        optText.onclick = () => {
            AllBtnModalThreeBtn.textContent = optText.textContent;

            AllButtonsSort.forEach(bA => bA.style.display = 'inline-block');

            optText.style.display = 'none';
        };
    });
 }

// DeleteAllTask
    deleteAllCheckbox.classList.add('slider::before')
    deleteAllCheckbox.addEventListener('change', function() {
        if (this.checked) {
            todoList.innerHTML = ''; 
    }
});
    // Слайдер удаления всех туду + локал хост
    deleteAllCheckbox.addEventListener('click', () => {
    const slider = document.querySelector('.slider');
    if (todoList.children.length === 0) {
       
        slider.classList.add('shake');
        setTimeout(() => slider.classList.remove('shake'), 300);
    } else {
        
        fetch("http://localhost:3000/todos/clear", {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(data => console.log(data.message))
        .catch(err => console.error("Ошибка при полной очистке:", err));
        todoList.innerHTML = '';
        allTodosData = []; 
        taskCountSpanAll.textContent = 0;
        if (typeof ActiveCount === 'function') ActiveCount();

        console.log('Список полностью очищен!');
    }
});

// Modal.Window-Log.
inputField.onkeydown = function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        e.stopPropagation(); 
        const text = this.value.trim();
        if (text) {
            const li = createTask(text, true);
            if (li) {
                todoList.appendChild(li);
                modal.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            this.value = '';
        }
        return false; 
    }
};

openModalBtn.addEventListener('click', () => {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Оверлей(вся страница в затемнении при нажатии на кнопку +)
overlay.addEventListener('click', closeBtn);

// Кнопки сортировки + открытие окна под ALL
const modalDivBtn = document.querySelector('.modal-buttons');

function openModal() {
    modalDivBtn.classList.toggle('active');
}

function closeModal() {
    modalDivBtn.classList.remove('active');
}


// Сменить тему на странице = темная => светлая 
const themeToggle = document.querySelector('.ButtonNight');
const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    }
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');

        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        themeToggle.style.opacity = '0.7';
        setTimeout(() => {
            themeToggle.style.opacity = '1';
        }, 100);
});

// Загрузка локал стораге, ключ => "todos" !!

async function loadTasks() {
    const saved = localStorage.getItem('todos');
    if (!saved) return;
    const tasks = JSON.parse(saved);
    const  response = await fetch("http://localhost:3000/todos");
    const data = await response.json();
    console.log(data);
    for (let i = 0; i < tasks.length; i++) {
        const text = tasks[i];
        
        const li = document.createElement('li');
        li.className = 'listTodo';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkboxInput';
        
        const span = document.createElement('span');
        span.textContent = text;
        span.className = 'SpanText';

        checkbox.onchange = function() {
            if (this.checked) {
                span.style.textDecoration = 'line-through';
            } else {
                span.style.textDecoration = 'none';
            }
        }

        const editButton = document.createElement('button')
        editButton.textContent = '';
        editButton.className = 'editButton';
        editButton.onclick = function(event) {
            editButton.disabled = true;

            const span = li.querySelector('span');
            const oldText = span.textContent;

            const input = document.createElement('input');
            input.value = oldText;
            input.className = 'edit-input';

            li.replaceChild(input, span);

            input.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    const newText = input.value.trim();
                    if (newText) {
                       
                        let allTasks = JSON.parse(localStorage.getItem('todos')) || [];
                        allTasks = allTasks.map(t => t === oldText ? newText : t);
                        localStorage.setItem('todos', JSON.stringify(allTasks));

                        const newSpan = document.createElement('span');
                        newSpan.className = 'NewTodoText';
                        newSpan.textContent = newText;

                        li.replaceChild(newSpan, input);
                        editButton.disabled = false;

                        // Добавление счетчика с модалкой в дом на кнопку + (ALL TASKS) =>
                        taskCountSpanAll.textContent = document.querySelectorAll('.listTodo').length;
                        divCounterTaskModal.classList.add('show'); 
                    }
                }
            }
        }   

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        li.appendChild(editButton);
        
        todoList.appendChild(li);
    } 
   ActiveCount(); 
}
// Загрузка ДОМ ELEMENTS => functionloadTasks()
document.addEventListener('DOMContentLoaded', loadTasks);

deleteAllCheckbox.addEventListener('change', function() {
    if (this.checked) {
        todoList.innerHTML = '';
        localStorage.removeItem('todos'); 

    // Добавление счетчика с модалкой в дом на кнопку + (ALL TASKS) =>
        taskCountSpanAll.textContent = 0;
        divCounterTaskModal.classList.add('show');
    }
});

// функция удаления сохранения массива сервера =>
function loadTodosFromServer() {
    fetch("http://localhost:3000/todos")
        .then(res => res.json())
        .then(todos => {
            allTodosData = todos; 
            renderTasks(allTodosData); 
        });
}

function renderTasks(tasksArray) {
    todoList.innerHTML = ''; 
    tasksArray.forEach(todo => {
        
        const li = createTask(todo.text, false); 
        todoList.appendChild(li);
    });
}

function loadTodosFromServer() {
    fetch("http://localhost:3000/todos")
        .then(res => res.json())
        .then(todos => {
            allTodosData = todos; 
            renderTasks(allTodosData); 
        })
        .catch(err => console.error("Ошибка загрузки:", err));
}

loadTodosFromServer();

// Функция handleSave(), обрабатывает создание новой задачи: валидирует ввод, добавляет задачу в DOM и обновляет локальные счетчики.
function handleSave() {
    const text = inputField.value.trim();

    if (!text) {
        alert('Поле не может быть пустым! Уволен!');
        return; 
    }

    const li = createTask(text, true);
    
    if (li) {
        todoList.appendChild(li); 
        
        
        allTodosData.push({ text: text, completed: false });
        taskCountSpanAll.textContent = document.querySelectorAll('.listTodo').length;
        divCounterTaskModal.classList.add('show');
        if (typeof ActiveCount === 'function') ActiveCount();

        inputField.value = '';

        console.log("Успешно добавлено!");
    }
}

inputField.onkeydown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
    }
};

saveBtn.onclick = (e) => {
    e.preventDefault();
    handleSave();
};

function loadTodosFromServer() {
    fetch("http://localhost:3000/todos")
        .then(res => res.json())
        .then(todos => {
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = createTask(todo.text, false, todo.completed);
                todoList.appendChild(li);
            });
            ActiveCount(); 
        });
}