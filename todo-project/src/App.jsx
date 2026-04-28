
import dayjs from 'dayjs';
import { useEffect, useState } from 'react'
import { Header } from './components/Header/Header.jsx'
import { TodoBody } from './components/SearchBar/AddTodoInput.jsx';
import './App.css'

// supabse
import { supabase } from './supabase.js';

function App() {

  // supabase test
  const [todoData, setTodoData] = useState([])
  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const { data, error } = await supabase
          .from('todo')
          .select()
        if (error) {
          console.log(error)
        }
        setTodoData(data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchTodo()
  }, [])

  console.log(todoData)
  /////////////////////--supabse test

  const [todo, setTodo] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    if (!savedTodos) return [];

    const parsed = JSON.parse(savedTodos);

    return parsed.map(t => ({
      ...t,
      isNew: false,
      createdAt: t.createdAt || dayjs().toISOString()
    }));
  });


  function getTasksCompleted() {
    return todo.filter((todoItem) => todoItem.status === true);
  }

  return (
    <div className='todo-container'>
      <Header />
      <TodoBody todo={todo} setTodo={setTodo} getTasksCompleted={getTasksCompleted} />
    </div>
  )
}

export default App
