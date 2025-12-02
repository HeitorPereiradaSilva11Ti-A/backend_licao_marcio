import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // carrega o .env

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

// pega as variáveis do .env
const { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } = process.env;

// cria o pool logo depois de extrair as variáveis
const database = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 10
});

// agora sim, define as rotas
app.get("/", (request, response) => {
  const selectCommand = "SELECT name, email, age, nickname FROM heitorpereira_sala02ma";
  database.query(selectCommand, (error, users) => {
    if (error) {
      console.log(error);
      return response.status(500).json({ message: "Erro no servidor" });
    }
    response.json(users);
  });
});

app.post("/login", (request, response) => {
  const { email, password } = request.body.user;
  const selectCommand = "SELECT * FROM heitorpereira_sala02ma WHERE email = ?";
  database.query(selectCommand, [email], (error, user) => {
    if (error) {
      console.log(error);
      return response.status(500).json({ message: "Erro no servidor" });
    }
    if (user.length === 0 || user[0].password !== password) {
      return response.json({ message: "Usuário ou senha incorretos!" });
    }
    response.json({ id: user[0].id, name: user[0].name });
  });
});

app.post("/cadastrar", (request, response) => {
  const { name, email, age, nickname, password } = request.body.user;
  const insertCommand = `
    INSERT INTO heitorpereira_sala02ma(name, email, age, nickname, password)
    VALUES (?, ?, ?, ?, ?)
  `;
  database.query(insertCommand, [name, email, age, nickname, password], (error) => {
    if (error) {
      console.log(error);
      return response.status(500).json({ message: "Erro ao cadastrar usuário" });
    }
    response.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}!`);
});
