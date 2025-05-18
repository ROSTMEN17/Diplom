const User = require('../models/user'); // Імпортуємо модель користувача

module.exports = async (req, res, next) => {
    if (req.session.user) {  // Перевіряємо, чи авторизований користувач
        req.user = await User.findById(req.session.user._id); // Якщо так, знаходимо його в базі та додаємо до req.user (для роботи методів mongoose)
        res.locals.isAuth = true; // Встановлюємо змінну авторизації користувача 
    } else {
        res.locals.isAuth = false;
    }

    next(); // Викликаємо наступний middleware
};