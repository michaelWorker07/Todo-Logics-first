function changeColor(color) {
    document.body.style.backgroundColor = color;
};

loadTasks();

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
        saveToLocalStorage();
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
    saveToLocalStorage();

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
     closeModal();
 }

//  удаление всех тудушек через свитч инпут
document.querySelector('.switch').addEventListener('click', (e) => {
    e.stopPropagation(); 
});


deleteAllCheckbox.addEventListener('change', function(e) {
    e.stopPropagation();
    const slider = document.querySelector('.slider');
    const hasTasks = todoList.children.length > 0;

    if (this.checked) {
        if (!hasTasks) {
            
            slider.classList.add('shake');
            setTimeout(() => {
                slider.classList.remove('shake');
                this.checked = false;
            }, 300);
        } else {
            todoList.innerHTML = '';
            allTodosData = []; 
            taskCountSpanAll.textContent = 0;
            if (typeof ActiveCount === 'function') ActiveCount();

           
            fetch("http://localhost:3000/todos/clear", { method: "DELETE" })
                .then(res => res.json())
                .then(data => console.log("Сервер очищен"))
        
                .catch(err => console.error("Ошибка сервера:", err));

            setTimeout(() => {
                this.checked = false;
            }, 500);

       saveToLocalStorage(); 
        }
    }
});

// Modal.Window-Log and error input. 
const errorMsg = document.querySelector('.error-msg');

inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        
        const text = this.value.trim();

        if (!text) {
            errorMsg.style.display = 'block'; 
            this.style.border = '1px solid red';
            return; 
        }
        errorMsg.style.display = 'none'; 
        this.style.border = '1px solid #F7F7F7'; 
        
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';

        try {
            const li = createTask(text, true);
            if (li) {
                todoList.appendChild(li);
                if (typeof ActiveCount === 'function') ActiveCount();
                saveToLocalStorage();
            }
        } catch (err) {
            console.error("Ошибка в createTask, но окно закрыто:", err);
        }

        this.value = ''; 
    }
});

// Чтобы ошибка пропадала, когда пользователь начинает печатать снова
inputField.addEventListener('input', function() {
    errorMsg.style.display = 'none';
    this.style.border = '1px solid #F7F7F7';
});

// Кнопка создать таску с уведомлением если поле пустое
saveBtn.addEventListener('click', () => {
    const text = inputField.value.trim();
    if (!text) {
        errorMsg.style.display = 'block'; 
        inputField.style.border = '1px solid red'; 
        return; 
    }

    errorMsg.style.display = 'none';
    inputField.style.border = '1px solid #F7F7F7';

    const li = createTask(text, true);
    if (li) {
        todoList.appendChild(li);
        
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        inputField.value = ''; 

        
        if (typeof ActiveCount === 'function') ActiveCount();
        saveToLocalStorage();
    }
});

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

overlay.addEventListener('click', () => {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto'; 
    inputField.value = ''; 
});

// Кнопки сортировки + открытие окна под ALL
const modalDivBtn = document.querySelector('.modal-buttons');


modalDivBtn.classList.remove('active'); 

function openModal(event) {
    
    if (event) event.stopPropagation(); 
    modalDivBtn.classList.toggle('active');
}

function closeModal() {
    modalDivBtn.classList.remove('active');
}

document.addEventListener('click', (event) => {

    const isClickInside = modalDivBtn.contains(event.target);
    
    if (modalDivBtn.classList.contains('active') && !isClickInside) {
        closeModal();
    }
});

modalDivBtn.addEventListener('click', (event) => {
    event.stopPropagation();
});


// Сменить тему на странице = темная => светлая 
const themeToggle = document.querySelector('.ButtonNight');



themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.style.opacity = '0.7';
    setTimeout(() => {
        themeToggle.style.opacity = '1';
    }, 100);
});

// Загрузка локал стораге, ключ => "todos" !!
function saveToLocalStorage() {
    const tasks = [];
    document.querySelectorAll('.listTodo').forEach(li => {
        tasks.push({
            text: li.querySelector('.SpanText').textContent,
            completed: li.querySelector('.checkboxInput').checked
        });
    });
    localStorage.setItem('todos', JSON.stringify(tasks));
}

async function loadTasks() {
    try {
        const response = await fetch("http://localhost:3000/todos");
        
        if (response.ok) {
            const serverTodos = await response.json();
            console.log("Загружено с сервера:", serverTodos);
            
            todoList.innerHTML = '';
            
            serverTodos.forEach(todo => {
                const li = createTask(todo.text, false, todo.completed);
                if (li) {
                    todoList.appendChild(li);
                }
            });
            
            saveToLocalStorage();
        } else {
           
            loadFromLocalStorage();
        }
    } catch (error) {
        console.log("Сервер недоступен, загружаем из localStorage");
        
        loadFromLocalStorage();
    }
    
    ActiveCount();
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('todos');
    if (!saved) return;
    
    const tasks = JSON.parse(saved);
    console.log("Загружено из localStorage:", tasks);
    
    todoList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = createTask(task.text, false, task.completed);
        if (li) {
            todoList.appendChild(li);
        }
    });
}
// async function loadTasks() {
//     const saved = localStorage.getItem('todos');
//     if (!saved) return;
//     const tasks = JSON.parse(saved);
//     const  response = await fetch("http://localhost:3000/todos");
//     const data = await response.json();
//     console.log(data);

//     todoList.innerHTML = '';

//     for (let i = 0; i < tasks.length; i++) {
//         const text = tasks[i];
        
//         const li = document.createElement('li');
//         li.className = 'listTodo';

//         const checkbox = document.createElement('input');
//         checkbox.type = 'checkbox';
//         checkbox.className = 'checkboxInput';
        
//         const span = document.createElement('span');
//         span.textContent = text;
//         span.className = 'SpanText';

//         checkbox.onchange = function() {
//             if (this.checked) {
//                 span.style.textDecoration = 'line-through';
//             } else {
//                 span.style.textDecoration = 'none';
//             }
//         }

//         const editButton = document.createElement('button')
//         editButton.textContent = '';
//         editButton.className = 'editButton';
//         editButton.onclick = function(event) {
//             editButton.disabled = true;

//             const span = li.querySelector('span');
//             const oldText = span.textContent;

//             const input = document.createElement('input');
//             input.value = oldText;
//             input.className = 'edit-input';

//             li.replaceChild(input, span);

//             input.onkeydown = (event) => {
//                 if (event.key === 'Enter') {
//                     const newText = input.value.trim();
//                     if (newText) {
                       
//                         let allTasks = JSON.parse(localStorage.getItem('todos')) || [];
//                         allTasks = allTasks.map(t => t === oldText ? newText : t);
//                         localStorage.setItem('todos', JSON.stringify(allTasks));

//                         const newSpan = document.createElement('span');
//                         newSpan.className = 'NewTodoText';
//                         newSpan.textContent = newText;

//                         li.replaceChild(newSpan, input);
//                         editButton.disabled = false;

//                         // Добавление счетчика с модалкой в дом на кнопку + (ALL TASKS) =>
//                         taskCountSpanAll.textContent = document.querySelectorAll('.listTodo').length;
//                         divCounterTaskModal.classList.add('show'); 
//                     }
//                 }
//             }
//         }   

//         li.appendChild(checkbox);
//         li.appendChild(span);
//         li.appendChild(deleteBtn);
//         li.appendChild(editButton);
        
//         todoList.appendChild(li);
//     } 
//    ActiveCount(); 
// }
// Загрузка ДОМ ELEMENTS => functionloadTasks()
document.addEventListener('DOMContentLoaded', loadTasks);



// функция удаления сохранения массива сервера =>

function loadTodosFromServer() {
    fetch("http://localhost:3000/todos")
        .then(res => res.json())
        .then(todos => {
            allTodosData = todos; 
            renderTasks(allTodosData); 
        })
        .catch(err => console.error("Ошибка загрузки:", err));
}


function renderTasks(tasksArray) {
    todoList.innerHTML = ''; 
    tasksArray.forEach(todo => {
        
        const li = createTask(todo.text, false); 
        todoList.appendChild(li);
    });
}




// Функция handleSave(), обрабатывает создание новой задачи: валидирует ввод, добавляет задачу в DOM и обновляет локальные счетчики.
function handleSave() {
    const text = inputField.value.trim();

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

