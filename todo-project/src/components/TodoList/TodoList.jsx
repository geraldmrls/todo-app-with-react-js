
import { useState } from "react"
import relativeTime from "dayjs/plugin/relativeTime"
import calendarImage from "../../assets/calendar.svg"
import EditImage from "../../assets/edit.svg?react"
import DeleteImage from "../../assets/delete.svg?react"
import Cirlce from "../../assets/circle.svg?react"
import Check from "../../assets/check.svg?react"
import "./TodoList.css"
import dayjs from "dayjs"
import { supabase } from "../../supabase"

dayjs.extend(relativeTime);


export function TodoList({ todo, setTodo, getTasksCompleted, buttonActive, filterInput }) {
    const [todoEdit, setTodoEdit] = useState(null);

    if (!todo) return null;

    async function deleteTodoButton(idToDelete) {

        const {error} = await supabase.from("todo").delete().eq("id", idToDelete)
        if(error){
            console.log(error)
            return
        }
        setTodo(prev=>{
            return prev.filter(prevItem=>{
                return prevItem.id !== idToDelete
            })
        })
    }

    function editTodoButton(idToEdit) {
        setTodo(prev => prev.map(todo =>
            todo.id === idToEdit ? { ...todo, editing: true } : todo
        ));
        const selectedTodo = todo.find(todoItem => todoItem.id === idToEdit);
        setTodoEdit(selectedTodo);

        // remove editing highlight after a short delay
        setTimeout(() => {
            const input = document.getElementById(`edit-input-${idToEdit}`);
            if (input) input.focus();
        }, 0);
    }

    function updateTodo(event) {
        const newValue = event.target.value;
        setTodoEdit({
            ...todoEdit,
            name: newValue,
        })
    }

    function saveUpdatedTodo() {
        if (!todoEdit) return;

        const updatedTodos = todo.map(todoItem => {
            if (todoItem.id === todoEdit.id) {
                // CHECK: Is the name actually different from the original?
                const hasChanged = todoItem.name !== todoEdit.name;

                return {
                    ...todoItem,
                    name: todoEdit.name,
                    // Only set updated to true if it was already updated OR if it actually changed now
                    updated: todoItem.updated || hasChanged
                }
            }
            return todoItem;
        });

        setTodo(updatedTodos);
        setTodoEdit(null);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            saveUpdatedTodo()
        }
    }

    async function checkTask(idToCheck) {
        const current = todo.find(t => t.id === idToCheck);

        const newStatus = !current.status;

        const { error } = await supabase
            .from("todo")
            .update({ status: newStatus })
            .eq("id", idToCheck);

        if (error) {
            console.log(error);
            return;
        }

        setTodo(prev =>
            prev.map(todoItem =>
                todoItem.id === idToCheck
                    ? { ...todoItem, status: newStatus }
                    : todoItem
            )
        );
    }

    const tasksToShow = todo.filter(todoItem => {
        const name = todoItem.name || ""; // 👈 fallback

        const matchesSearch = name
            .toLowerCase()
            .includes((filterInput || "").toLowerCase());

        if (!matchesSearch) return false;

        if (buttonActive === "ALL") return true;
        if (buttonActive === "ACTIVE") return todoItem.status === false;
        if (buttonActive === "COMPLETED") return todoItem.status === true;

        return true;
    });

    return (
        <div className="todo-items-container">
            {tasksToShow.map(todoElement => {

                const isNew = todoElement.isNew;

                return (
                    <div className={`todo-value-container ${isNew ? "new-todo" : ""} ${todoElement.removing ? "removing" : ""}`} key={todoElement.id}>

                        <div className="todo-added-container">

                            <div className="circle-check-contianer" onClick={() => {
                                checkTask(todoElement.id);
                                getTasksCompleted()
                            }}>
                                <Check className={`check-image ${todoElement.status === true ? "check-reveal" : ""}`} />

                                <Cirlce className={`circle-image ${todoElement.status === true ? "circle-clicked" : ""}`} />
                            </div>

                            <input id={`edit-input-${todoElement.id}`}
                                type="text"
                                className={todoEdit?.id === todoElement.id ? "show-edit-input" : "remove-edit-input"}
                                value={todoEdit?.name || ""}
                                onChange={updateTodo}
                                onKeyDown={handleKeyDown}
                                onBlur={saveUpdatedTodo}
                                autoFocus />

                            <div className={todoEdit?.id === todoElement.id ? "remove-todo-left-side" : "todo-left-side"}>

                                <div className={todoEdit?.id === todoElement.id ? "remove-todo-name-container" : "todo-name-container"}>
                                    <span className={`todo ${todoElement.status ? "todo-crossed" : ""}`}>
                                        {todoElement.name}
                                    </span>
                                    <div className={todoEdit?.id === todoElement.id ? "remove-todo-date-container" : "todo-date-container"}>
                                        <img className="calendar-image" src={calendarImage} />
                                        <span className="todo-date-added">
                                            {todoElement.createdAt
                                                ? dayjs(todoElement.createdAt).fromNow()
                                                : "No date"}
                                        </span>
                                        <span className={todoElement.updated ? "todo-is-updated" : ""}>{`${todoElement.updated ? "· Updated" : ""}`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="todo-right-side">



                            <EditImage className="edit-image" onClick={() => {
                                editTodoButton(todoElement.id)
                            }} />
                            <div className="edit-image-cirlce"></div>

                            <DeleteImage className="delete-image" onClick={() => {
                                deleteTodoButton(todoElement.id)
                            }} />
                            <div className="delete-image-circle"></div>

                        </div>
                    </div>
                )
            })}

        </div>
    )
}
