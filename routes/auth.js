const { Router } = require('express'); // Імпортуємо Router з Express
const router = Router(); // Створюємо екземпляр роутера
const User = require('../models/user'); // Імпортуємо модель користувача
const bcrypt = require('bcryptjs'); // Імпортуємо bcrypt для шифрування паролів

// GET-запит на сторінку реєстрації
router.get('/registration', (req, res) => {
    res.render('registration', {
        title: 'Реєстрація',
    }); // Рендеримо сторінку реєстрації
});

// POST-запит для реєстрації користувача
router.post('/registration', async (req, res) => {
    const { name, email } = req.body; // Отримуємо дані з форми
    const candidate = await User.findOne({ email }).lean(); // Шукаємо користувача в базі за email, та повертаємо чисті данні, без методів mongoose

    if (candidate) {
        res.send('Користувач з таким email вже існує'); // Якщо користувач вже є, виводимо повідомлення
    } else {
        const password = await bcrypt.hash(req.body.password, 10); // Шифруємо пароль
        const newUser = new User({ name, email, password, plans: [] }); // Створюємо нового користувача
        await newUser.save(); // Зберігаємо користувача в базу
        res.redirect('/login'); // Після реєстрації перенаправляємо на сторінку входу
    }
});

// GET-запит на сторінку логіна
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Вхід',
    }); // Рендеримо сторінку входу
});

// POST-запит для авторизації користувача
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // Отримуємо дані з форми
    const candidate = await User.findOne({ email }).lean(); // Шукаємо користувача за email

    if (!candidate) {
        res.redirect('/login'); // Якщо користувач не знайдений, повертаємо на сторінку входу
    } else {
        const verifyPassword = await bcrypt.compare(password, candidate.password); // Порівнюємо хешований пароль

        if (!verifyPassword) {
            res.redirect('/login'); // Якщо пароль не співпав, повертаємо на логін
        } else {
            req.session.user = candidate; // Зберігаємо користувача в сесії
            req.session.isAuth = true; // Позначаємо, що користувач авторизований
            req.session.save(() => {
                res.redirect('/'); // Після збереження сесії перенаправляємо на головну сторінку
            });
        }
    }
});

// GET-запит для виходу з облікового запису
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login'); // Видаляємо сесію і перенаправляємо на сторінку входу
    });
});

module.exports = router; // Експортуємо роутер
