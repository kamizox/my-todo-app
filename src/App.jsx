import { useState, useEffect, useMemo } from 'react'
import TodoItem from './components/TodoItem'
import './App.css'

const STORAGE_KEY = 'react-todo-items'

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.text === 'string' &&
        typeof t.completed === 'boolean'
    )
  } catch {
    return []
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [inputError, setInputError] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'completed') return todos.filter((t) => t.completed)
    return todos
  }, [todos, filter])

  function handleAdd(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) {
      setInputError(true)
      return
    }
    setInputError(false)
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
      },
    ])
    setInput('')
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Todo List</h1>
        <p className="stats">
          Total: <strong>{todos.length}</strong>
          {todos.length > 0 && (
            <>
              {' '}
              · Completed:{' '}
              <strong>{todos.filter((t) => t.completed).length}</strong>
            </>
          )}
        </p>
      </header>

      <form className="add-form" onSubmit={handleAdd} noValidate>
        <div className="add-row">
          <input
            type="text"
            className={inputError ? 'input input--error' : 'input'}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (inputError) setInputError(false)
            }}
            placeholder="What needs to be done?"
            aria-invalid={inputError}
            aria-describedby={inputError ? 'input-hint' : undefined}
          />
          <button type="submit">Add</button>
        </div>
        {inputError && (
          <p id="input-hint" className="hint" role="alert">
            Please enter some text before adding a todo.
          </p>
        )}
      </form>

      <div className="filters" role="group" aria-label="Filter todos">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={filter === key ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredTodos.length === 0 ? (
        <p className="empty">
          {todos.length === 0
            ? 'No todos yet. Add one above.'
            : 'No todos match this filter.'}
        </p>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
