
import { useState, useEffect } from "react";
import { WeeklyProgress } from "../WeeklyProgress/WeeklyProgress.jsx";
import { TodoList } from "../TodoList/TodoList.jsx";
import { FilterTodo } from "../FilterTodo/FilterTodo.jsx"
import AddImage from "../../assets/add.svg?react"
import "./AddTodoInput.css"

// supabase
import { supabase } from "../../supabase.js";

export function TodoBody({ todo, setTodo, getTasksCompleted }) {
    const [inputValue, setInputValue] = useState("");
    const [buttonActive, setButtonActive] = useState(() => {
        const buttonActiveSaved = localStorage.getItem("clicked-button");
        return buttonActiveSaved ? JSON.parse(buttonActiveSaved) : "ALL";
    });
    const [filterInput, setFilterInput] = useState("");
    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todo))
    }, [todo]);

    function handleInput(event) {
        const todoValue = event.target.value;
        setInputValue(todoValue);
    }    

    async function handleAddButton() {
        if (inputValue.trim() === "") return;
        const {data, error} = await supabase.from("todo").insert({name: inputValue}).select()
        if(error){
            console.log(error)
            return
        }

        setTodo(currentTodo=>[...currentTodo, ...data])

        // clear input box
        setInputValue("");

    }

    function pressEnterKey(event) {
        if (event.key === "Enter") {
            handleAddButton();
        }
    }

    return (
        <>
            <div className="add-task-container">
                <input value={inputValue} className="input-todo" type="text" placeholder="Add a new task..." onChange={handleInput} onKeyDown={pressEnterKey} />
                <AddImage alt="add-image" className="add-image" onClick={handleAddButton} />
            </div>
            <WeeklyProgress todo={todo} getTasksCompleted={getTasksCompleted} />
            <FilterTodo buttonActive={buttonActive} setButtonActive={setButtonActive} setFilterInput={setFilterInput}/>
            <TodoList todo={todo} setTodo={setTodo} getTasksCompleted={getTasksCompleted} buttonActive={buttonActive} filterInput={filterInput}/>

        </>
    )
}