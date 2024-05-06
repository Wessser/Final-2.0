import express from 'express'; //=========================================================================== Подключение express
import fs from 'fs';//=========================================================================== Подключение fs
import multer from 'multer';//=========================================================================== Подключение multer
import cors from 'cors';//=========================================================================== Подключение cors

import mongoose from 'mongoose';//========================================================================== Подключение mongoose

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';

mongoose // Подключение к БД
  .connect('mongodb+srv://wessertv:1QAZ2wsx3EDC.@cluster0.jdmcm3o.mongodb.net/')
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
  // Определяет папку, в которую будут сохраняться загруженные файлы
  destination: (_, __, cb) => {
    // Если папка "uploads" не существует, создаем ее
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads'); // Создаем папку "uploads"
    }
    // Передаем путь к папке "uploads" во второй аргумент callback
    cb(null, 'uploads'); // Передаем null в первый аргумент, указывающий на отсутствие ошибок
  },
  
  // Определяет, как именовать загруженные файлы
  filename: (_, file, cb) => {
    // Устанавливаем имя файла равное оригинальному имени файла
    cb(null, file.originalname); // Передаем null в первый аргумент и оригинальное имя файла во второй аргумент
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);//-- Авторизация
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);//=- Регистрация
app.get('/auth/me', checkAuth, UserController.getMe);//=-- Получение информации о пользователе

app.post('/upload', checkAuth, upload.single('image'), (req, res) => { //======================= Загрузка изображения
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);//==-- Получение последних тегов

app.get('/posts', PostController.getAll);//==-- Получение всех постов
app.get('/posts/tags', PostController.getLastTags);//==-- Получение последних тегов
app.get('/posts/:id', PostController.getOne);//==-- Получение одного поста по id
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);//==-- Создание поста
app.delete('/posts/:id', checkAuth, PostController.remove);//==== Удаление поста по id
app.patch(//===================== Обновление поста по id
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(process.env.PORT || 4444, (err) => {//============================= Запуск сервера
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});
