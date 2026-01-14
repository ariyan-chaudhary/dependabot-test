from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# In-memory storage for todos
todos = [
    {
        "id": "1", 
        "title": "Learn Flask", 
        "description": "Study the basics of Flask routing and views",
        "importance": "Normal",
        "completed": False
    },
    {
        "id": "2", 
        "title": "Learn React", 
        "description": "Understand components, hooks, and state",
        "importance": "Urgent",
        "completed": False
    }
]

@app.route('/api/todos', methods=['GET'])
def get_todos():
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.json
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    new_todo = {
        "id": str(uuid.uuid4()),
        "title": data['title'],
        "description": data.get('description', ''),
        "importance": data.get('importance', 'Normal'),
        "completed": False
    }
    todos.append(new_todo)
    return jsonify(new_todo), 201

@app.route('/api/todos/<todo_id>', methods=['PUT'])
def toggle_todo(todo_id):
    todo = next((t for t in todos if t['id'] == todo_id), None)
    if not todo:
        return jsonify({"error": "Todo not found"}), 404
    
    todo['completed'] = not todo['completed']
    return jsonify(todo)

@app.route('/api/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    global todos
    todos = [t for t in todos if t['id'] != todo_id]
    return jsonify({"message": "Deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
