import pytest
import json
from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestTodoAPI:
    """Test cases for Todo API endpoints."""
    
    def test_get_todos(self, client):
        """Test retrieving all todos."""
        response = client.get('/api/todos')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) >= 2  # Should have initial todos
    
    def test_get_todos_structure(self, client):
        """Test that returned todos have correct structure."""
        response = client.get('/api/todos')
        data = json.loads(response.data)
        
        for todo in data:
            assert 'id' in todo
            assert 'title' in todo
            assert 'description' in todo
            assert 'importance' in todo
            assert 'completed' in todo
            assert isinstance(todo['completed'], bool)
    
    def test_add_todo_success(self, client):
        """Test successfully adding a new todo."""
        new_todo = {
            'title': 'Test Task',
            'description': 'This is a test task',
            'importance': 'Urgent'
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(new_todo),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == 'Test Task'
        assert data['description'] == 'This is a test task'
        assert data['importance'] == 'Urgent'
        assert data['completed'] == False
        assert 'id' in data
    
    def test_add_todo_missing_title(self, client):
        """Test adding todo without title (should fail)."""
        new_todo = {
            'description': 'No title task'
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(new_todo),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_add_todo_default_importance(self, client):
        """Test that importance defaults to 'Normal' if not provided."""
        new_todo = {
            'title': 'Default Importance Task'
        }
        response = client.post(
            '/api/todos',
            data=json.dumps(new_todo),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['importance'] == 'Normal'
    
    def test_toggle_todo(self, client):
        """Test toggling a todo's completion status."""
        # Get initial todos
        response = client.get('/api/todos')
        todos = json.loads(response.data)
        todo_id = todos[0]['id']
        initial_status = todos[0]['completed']
        
        # Toggle the todo
        response = client.put(f'/api/todos/{todo_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['completed'] == (not initial_status)
    
    def test_toggle_nonexistent_todo(self, client):
        """Test toggling a todo that doesn't exist."""
        response = client.put('/api/todos/nonexistent-id')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_delete_todo(self, client):
        """Test deleting a todo."""
        # Add a todo first
        new_todo = {'title': 'To be deleted'}
        response = client.post(
            '/api/todos',
            data=json.dumps(new_todo),
            content_type='application/json'
        )
        todo_id = json.loads(response.data)['id']
        
        # Delete the todo
        response = client.delete(f'/api/todos/{todo_id}')
        assert response.status_code == 200
        
        # Verify it's deleted
        response = client.get('/api/todos')
        todos = json.loads(response.data)
        assert not any(t['id'] == todo_id for t in todos)
    
    def test_delete_nonexistent_todo(self, client):
        """Test deleting a todo that doesn't exist."""
        response = client.delete('/api/todos/nonexistent-id')
        assert response.status_code == 200  # Still returns success message
