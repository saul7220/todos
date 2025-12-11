// ...existing code...
// URL del backend API
const API_URL = 'http://localhost:8000/api';

// Cargar todas las tareas al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    
    // Permitir crear tarea con Enter
    document.getElementById('todoInput').addEventListener('keydown', (e) => { // cambiado a 'keydown'
        if (e.key === 'Enter') {
            createTodo();
        }
    });
});
// ...existing code...

// Función para cargar todas las tareas desde el backend
async function loadTodos() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        const todos = await response.json();
        
        displayTodos(todos);
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        alert('Error al conectar con el servidor. Verifica que el backend esté corriendo.');
    }
}

// Función para mostrar las tareas en el HTML
function displayTodos(todos) {
    const todoList = document.getElementById('todoList');
    
    // ✅ CORRECCIÓN 1: Validar array vacío
    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No hay tareas. ¡Agrega una nueva!</div>';
        return;
    }
    
    // ✅ CORRECCIÓN 2: Formato correcto del template string y escape de caracteres
    todoList.innerHTML = todos.map(todo => {
        // Escapar caracteres especiales para HTML y JavaScript
        const escapedTitle = todo.title
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        // Escapar para JavaScript (en el atributo onclick)
        const jsEscapedTitle = todo.title.replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        return `
        <div class="todo-item" id="todo-${todo.id}">
            <span 
                class="todo-text"
                id="text-${todo.id}"
                ondblclick="enableEdit(${todo.id}, '${jsEscapedTitle}')"
            >
                ${escapedTitle}
            </span>
            <div class="actions">
                <button class="edit-btn" onclick="enableEdit(${todo.id}, '${jsEscapedTitle}')">
                    Editar
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    Eliminar
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// ✅ CORRECCIÓN 3: Función enableEdit mejorada
function enableEdit(id, currentTitle) {  // ✅ Corregido: "currentTitle" en lugar de "currenTitle"
    const item = document.getElementById(`todo-${id}`);
    const textSpan = document.getElementById(`text-${id}`);
    
    if (!item || !textSpan) {
        console.error('No se encontró el elemento a editar');
        return;
    }
    
    // Crear un input field para la edición
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = currentTitle;
    inputField.className = 'edit-input';
    inputField.maxLength = 255;

    // Crear el botón de guardar 
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar';
    saveButton.className = 'save-btn';
    saveButton.onclick = () => saveTodo(id, inputField.value);

    // Crear botón de cancelar
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.className = 'cancel-btn';
    cancelButton.onclick = () => loadTodos(); // Recargar para cancelar

    // ✅ CORRECCIÓN 4: Reemplazar correctamente usando el padre del span
    const parentElement = textSpan.parentElement;
    parentElement.replaceChild(inputField, textSpan);
    
    // ✅ CORRECCIÓN 5: Limpiar y agregar botones correctamente
    const actionsDiv = item.querySelector('.actions');
    if (actionsDiv) {
        actionsDiv.innerHTML = '';
        actionsDiv.appendChild(saveButton);
        actionsDiv.appendChild(cancelButton);
    }

    inputField.focus();
    inputField.select();
    
    // Permitir guardar con Enter y cancelar con Escape
    inputField.addEventListener('keydown', (e) => { // cambiado a 'keydown'
        if (e.key === 'Enter') {
            saveTodo(id, inputField.value);
        } else if (e.key === 'Escape') {
            loadTodos(); // Cancelar
        }
    });
}

// ✅ CORRECCIÓN 6: Función saveTodo mejorada
async function saveTodo(id, newTitle) {
    const title = newTitle.trim();
    
    if (!title) {
        alert('El título no puede estar vacío');
        return;
    }

    try {
        // ✅ CORRECCIÓN: Sin espacio antes del backtick
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        if (response.ok) {
            loadTodos();
        } else {
            // ✅ CORRECCIÓN: Mostrar el error real del servidor
            try {
                const error = await response.json();
                alert(`Error al actualizar: ${error.detail || 'Error desconocido'}`);
            } catch (e) {
                alert(`Error al actualizar: ${response.status} ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        alert('Error al actualizar la tarea');
    }
}

// Función para crear una nueva tarea
async function createTodo() {
    const input = document.getElementById('todoInput');
    const title = input.value.trim();
    
    if (!title) {
        alert('Por favor escribe una tarea');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        if (response.ok) {
            input.value = '';
            loadTodos(); // Recargar la lista
        }
    } catch (error) {
        console.error('Error al crear tarea:', error);
        alert('Error al crear la tarea');
    }
}

// Función para eliminar una tarea
async function deleteTodo(id) {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTodos(); // Recargar la lista
        }
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        alert('Error al eliminar la tarea');
    }
}

// Exponer funciones al scope global para que los onclick/ondblclick en el HTML funcionen cuando el script se cargue como módulo o en otros contextos
window.loadTodos = loadTodos;
window.createTodo = createTodo;
window.enableEdit = enableEdit;
window.saveTodo = saveTodo;
window.deleteTodo = deleteTodo;
// ...existing code...