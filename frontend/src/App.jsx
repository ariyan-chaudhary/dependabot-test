import { useState, useEffect } from 'react'
import Select from 'react-select'
import './App.css'

const importanceOptions = [
  { value: 'Normal', label: 'Normal', color: 'green' },
  { value: 'Moderate', label: 'Moderate', color: '#d97706' }, // darker amber
  { value: 'Urgent', label: 'Urgent', color: 'red' }
]

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.data.color,
    fontWeight: 'bold'
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.data.color,
    fontWeight: 'bold'
  })
}

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [importance, setImportance] = useState(importanceOptions[0])

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/todos')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const response = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          importance: importance.value
        })
      })
      const todo = await response.json()
      setTodos([...todos, todo])
      setTitle('')
      setDescription('')
      setImportance(importanceOptions[0])
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const toggleTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PUT'
      })
      const updatedTodo = await response.json()
      setTodos(todos.map(t => (t.id === id ? updatedTodo : t)))
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE'
      })
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const getImportanceColor = (imp) => {
    const opt = importanceOptions.find(o => o.value === imp)
    return opt ? opt.color : 'black'
  }

  return (
    <div className="app-container">
      <h1>Task Manager</h1>
      
      <form onSubmit={addTodo} className="todo-form">
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (required)"
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description..."
            className="input-field textarea-field"
          />
        </div>
        <div className="form-group">
          <Select 
            options={importanceOptions} 
            value={importance} 
            onChange={setImportance}
            styles={customStyles}
            placeholder="Importance"
            className="react-select-container"
          />
        </div>
        <button type="submit" className="add-btn">Add Task</button>
      </form>

      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
             <div className="todo-content" onClick={() => toggleTodo(todo.id)}>
                <div className="todo-header">
                  <span className="todo-title">{todo.title}</span>
                  <span 
                    className="todo-importance"
                    style={{ color: getImportanceColor(todo.importance), border: `1px solid ${getImportanceColor(todo.importance)}` }}
                  >
                    {todo.importance}
                  </span>
                </div>
                {todo.description && <p className="todo-description">{todo.description}</p>}
             </div>
             <button onClick={() => deleteTodo(todo.id)} className="delete-btn">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
