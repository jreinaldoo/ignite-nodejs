const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(u => u.username === username);

  if (!user) {
    return response.status(400).json({
      error: 'User not found'
    });
  }
  request.user = user;
  return next();
}

function validateExistsUserBeforeCreate(request, response, next) {
  const { username } = request.body;
  
  const user = users.find(u => u.username === username);
  if (user) {
    return response.status(400).json( { error: 'User already exists.' });
  } 
  return next();
}


function checkExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find(t => t.id === id);
  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found.'
    });
  } 
  return next();
}

app.post('/users', validateExistsUserBeforeCreate, (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).send(user.todos);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(t => t.id === id);

  todo.done = true;
   return response.status(200).send(todo);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  user.todos.splice(user.todos.findIndex(item => item.id === id), 1)
  return response.status(204).json(user);
});
  

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = user.todos.find(t => t.id === id);

  todo.title = title;
  todo.deadline = deadline;
   return response.status(200).send(todo);
});

module.exports = app;