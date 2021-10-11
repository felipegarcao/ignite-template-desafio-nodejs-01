const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User does not exists' });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todosOperation);

  return response.status(201).json(todosOperation);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);

  if(!checkTodo) {
    return response.status(404).json({error: "Todo not found"});
  }

  checkTodo.title = title;
  checkTodo.deadline = new Date(deadline);

  return response.json(checkTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Todo not found"});
  }

  todo.done = true;

  return response.json(todo)


});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params

  const todoExists = user.todos.findIndex(todo => todo.id === id);

  if(todoExists === -1) {
    return response.status(404).json({error: 'Todo not found'});
  }

  user.todos.splice(todoExists, 1);

  return response.status(204).send()

});

module.exports = app;
