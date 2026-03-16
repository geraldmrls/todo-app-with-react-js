
import { useState, useEffect, useRef } from "react"
import relativeTime from "dayjs/plugin/relativeTime"
import calendarImage from "../../assets/calendar.svg"
import EditImage from "../../assets/edit.svg?react"
import DeleteImage from "../../assets/delete.svg?react"
import Cirlce from "../../assets/circle.svg?react"
import Check from "../../assets/check.svg?react"
import "./TodoList.css"
import dayjs from "dayjs"

dayjs.extend(relativeTime);


export function TodoList({ todo, setTodo, getTasksCompleted, buttonActive, filterInput }) {
    const [todoEdit, setTodoEdit] = useState(null);
    const todoContainerRef = useRef(null)
    const [, setTick] = useState(0);

    // 1. Create a ref to track processed IDs
    const processedTodos = useRef(new Set());

    useEffect(() => {
        // Find todos that are isNew AND haven't been processed yet
        const newItems = todo.filter(t => t.isNew && !processedTodos.current.has(t.id));

        if (newItems.length > 0) {
            const timeout = setTimeout(() => {
                setTodo(prevTodos =>
                    prevTodos.map(t => ({ ...t, isNew: false }))
                );

                // Mark these IDs as processed so this doesn't run again for them
                newItems.forEach(t => processedTodos.current.add(t.id));
            }, 50);

            return () => clearTimeout(timeout);
        }
    }, [todo, setTodo]); // Now safe to include both!

    useEffect(() => {
        const containerElem = todoContainerRef.current;
        if (containerElem) {
            // Only scroll if the last todo is new
            const lastTodo = todo[todo.length - 1];
            if (lastTodo?.isNew) {
                containerElem.scrollTop = containerElem.scrollHeight;
            }
        }
    }, [todo]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(prev => prev + 1);
        }, 1000)
        return () => clearInterval(interval)
    }, [])


    if (!todo) return null;

    function deleteTodoButton(idToDelete) {
        // Add removing class first
        setTodo(prevTodos =>
            prevTodos.map(todo =>
                todo.id === idToDelete ? { ...todo, removing: true } : todo
            )
        );

        // Remove from state after animation
        setTimeout(() => {
            setTodo(prevTodos => prevTodos.filter(todo => todo.id !== idToDelete));
        }, 300); // match the CSS transition duration
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

    function checkTask(idToCheck) {
        const updatedTodos = todo.map(todoItem => {
            if (todoItem.id === idToCheck) {
                return {
                    ...todoItem,
                    status: !todoItem.status
                }
            }
            return todoItem;
        });
        setTodo(updatedTodos)
    }

    const tasksToShow = todo.filter(todoItem => {
        const matchesSearch = todoItem.name.toLowerCase().includes(filterInput.toLowerCase());

        if (!matchesSearch) return false; // skip todos that don't match search

        if (buttonActive === "ALL") {
            return true; // show all that match search
        } else if (buttonActive === "ACTIVE") {
            return todoItem.status === false; // only active
        } else if (buttonActive === "COMPLETED") {
            return todoItem.status === true; // only completed
        }

        return true; // fallback
    });


    return (
        <div className="todo-items-container" ref={todoContainerRef}>
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
