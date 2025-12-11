from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Todo
from schemas import TodoCreate, TodoResponse

router = APIRouter()

@router.get("/todos", response_model=List[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    """Obtener todas las tareas"""
    todos = db.query(Todo).order_by(Todo.created_at.desc()).all()
    return todos

@router.post("/todos", response_model=TodoResponse)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    """Crear una nueva tarea"""
    new_todo = Todo(title=todo.title)
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """Eliminar una tarea"""
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    db.delete(todo)
    db.commit()
    return {"message": "Tarea eliminada exitosamente"}

@router.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo_data: TodoCreate, db: Session= Depends(get_db)):
    """Actualizar una tarea existente"""

    #1 Buscara la tarea por ID
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
     #2 Manejo de error si no se encuentra 
    
    if not todo:
        raise HTTPException(status_code=404 , detail="Tarea no encontrada")

        #3 Actualizar los campos 
        #Asumimos que solo se puede actualizar el 'title'
        todo.title = todo_data.title
        
        #4. Confirmar y refrescar 
    db.commit()
    db.refresh(todo)
    return todo
