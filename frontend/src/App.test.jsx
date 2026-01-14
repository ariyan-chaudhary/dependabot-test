import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

// Mock fetch
global.fetch = vi.fn()

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test to prevent implementation bleeding
    fetch.mockReset()
  })

  it('renders the task manager heading', () => {
    fetch.mockResolvedValueOnce({
      json: async () => []
    })
    render(<App />)
    expect(screen.getByText('Task Manager')).toBeInTheDocument()
  })

  it('fetches and displays todos on mount', async () => {
    const mockTodos = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        importance: 'Normal',
        completed: false
      }
    ]
    
    fetch.mockResolvedValueOnce({
      json: async () => mockTodos
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })

  it('displays todo title and importance', async () => {
    const mockTodos = [
      {
        id: '1',
        title: 'Urgent Task',
        description: 'Important work',
        importance: 'Urgent',
        completed: false
      }
    ]
    
    fetch.mockResolvedValueOnce({
      json: async () => mockTodos
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Urgent Task')).toBeInTheDocument()
      expect(screen.getByText('Urgent')).toBeInTheDocument()
    })
  })

  it('displays todo description when present', async () => {
    const mockTodos = [
      {
        id: '1',
        title: 'Task with description',
        description: 'This is the description',
        importance: 'Normal',
        completed: false
      }
    ]
    
    fetch.mockResolvedValueOnce({
      json: async () => mockTodos
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('This is the description')).toBeInTheDocument()
    })
  })

  it('allows adding a new todo', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => []
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({
        id: '2',
        title: 'New Task',
        description: 'New Description',
        importance: 'Moderate',
        completed: false
      })
    })

    render(<App />)
    
    const titleInput = screen.getByPlaceholderText('Title (required)')
    const descriptionInput = screen.getByPlaceholderText('Description...')
    const addButton = screen.getByText('Add Task')

    fireEvent.change(titleInput, { target: { value: 'New Task' } })
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } })
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/todos',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  it('allows toggling a todo', async () => {
    const mockTodos = [
      {
        id: '1',
        title: 'Toggle Test',
        description: '',
        importance: 'Normal',
        completed: false
      }
    ]
    
    fetch.mockResolvedValueOnce({
      json: async () => mockTodos
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({
        ...mockTodos[0],
        completed: true
      })
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Toggle Test')).toBeInTheDocument()
    })

    const todoContent = screen.getByText('Toggle Test').closest('.todo-content')
    fireEvent.click(todoContent)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({
          method: 'PUT'
        })
      )
    })
  })

  it('allows deleting a todo', async () => {
    const mockTodos = [
      {
        id: '1',
        title: 'Delete Test',
        description: '',
        importance: 'Normal',
        completed: false
      }
    ]
    
    fetch.mockResolvedValueOnce({
      json: async () => mockTodos
    })
    fetch.mockResolvedValueOnce({
      json: async () => ({ message: 'Deleted successfully' })
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Delete Test')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  it('shows all three importance options', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => []
    })

    render(<App />)
    
    await waitFor(() => {
      // The importance dropdown should contain these options
      expect(screen.getByText('Normal')).toBeInTheDocument()
    })
  })

  it('requires title field to add todo', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => []
    })

    render(<App />)
    
    const addButton = screen.getByText('Add Task')
    const titleInput = screen.getByPlaceholderText('Title (required)')

    // Try to add without title
    expect(titleInput).toHaveAttribute('required')
  })
})
