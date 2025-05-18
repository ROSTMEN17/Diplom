// Імпортуємо модулі
const express = require('express') // імпорт експрес
const handlebars = require('express-handlebars') // імпорт handlebars (для роботи з шаблонами HTML-сторінок)
const mongoose = require('mongoose') //  імпорт mongoose (для роботи з базою даних)
const session = require('express-session')  // Підключаємо express-session для роботи з сесіями користувачів
const mongoSession = require('connect-mongodb-session')(session) // Зберігаємо сесії у базі даних MongoDB


// Імпортуємо маршрути
const routeHome = require('./routes/home.js') // Маршрут для головної сторінки
const routeMyPlans = require('./routes/my-plans') // Маршрут для сторінки "Мої плани"
const routeSearchPlaces = require('./routes/search-places.js') // Маршрут для пошуку місць
const routeAuth = require('./routes/auth') // Маршрут для авторизації

const middlewareUser = require('./middleware/user') 


// Отримуємо URI для підключення до MongoDB
const uri = process.env.MONGO_URI

const app = express() // Створюємо додаток Express

// Налаштовуємо Handlebars як шаблонізатор
const hbs = handlebars.create({ 
    defaultLayout: 'main', // Встановлюємо головний макет за замовчуванням (файл main.hbs)
    extname: 'hbs' // Вказуємо, що файли шаблонів мають розширення .hbs
})


app.engine('hbs', hbs.engine) // Реєструємо Handlebars у Express як рушій шаблонів
app.set('view engine', 'hbs') // Вказуємо, що за замовчуванням використовуватиметься Handlebars
app.set('views', 'views') // Вказуємо папку, де зберігатимуться шаблони

app.use(express.static('public')) // Встановлюємо статичну папку "public" для зберігання CSS, зображень тощо
app.use(express.urlencoded({extended: true})) // Дозволяє Express обробляти дані, надіслані через форми (application/x-www-form-urlencoded)
app.use(express.json()); // Дозволяє Express обробляти JSON-дані, що надходять у запитах

const store = mongoSession({ // Налаштовуємо сховище для сесій у MongoDB
    databaseName: 'travel',
    collection: 'sessions', // Вказуємо, що сесії зберігатимуться у колекції "sessions"
    uri: uri // Використовуємо URI для підключення до бази даних
})
app.use(session({ // Налаштовуємо middleware для роботи із сесіями
    secret: 'secret', // Секретний ключ для підпису сесій (його слід зберігати у змінних середовища)
    resave: false, // Не зберігати сесію в базі даних, якщо вона не змінювалася
    saveUninitialized: false, // Не створювати нові сесії, якщо вони ще не ініціалізовані
    store // Використовуємо сховище MongoDB для сесій
}))
app.use(middlewareUser)

// Реєструємо маршрути
app.use('/search', routeSearchPlaces); // Обробник для пошуку місць - використовуємо спеціальний префікс
app.use('/', routeHome); // Обробник для головної сторінки
app.use('/', routeMyPlans); // Обробник для сторінки "Мої плани"
app.use('/', routeAuth); // Обробник для авторизації



async function start(){ // Функція для запуску сервера тільки після підключення до БД
    try{ 
        await mongoose.connect(uri, {dbName: "travel"}) // підключення до бази данних mongodb
        app.listen(3000, err => err ? console.log(err) : console.log('start')) // запускаємо сервер на порту 3000
    }catch(error){
        throw error
    }
}

// Викликаємо функцію start() для запуску сервера
start();









