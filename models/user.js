const { Schema, model } = require('mongoose'); // Імпортуємо Schema та model з mongoose

// Створюємо схему користувача
const UserSchema = new Schema({
    name: { 
        type: String, // Поле `name` - типу рядок
        required: true // Обов'язкове поле
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    plans: [ // Масив планів подорожей
        {
            name: String,   // Назва місця
            address: String, // Адреса місця
            image: String   // URL зображення
        }
    ]
});

// Метод для додавання місця до плану подорожей
UserSchema.methods.addToPlan = async function(image, name, address) {
    this.plans.push({ image, name, address }); // Додаємо новий об'єкт з отриманими аргументами у масив планів
    await this.save(); // Зберігаємо зміни в базі
};

// Метод для видалення місця з плану
UserSchema.methods.removePlan = async function(id) {
    
    this.plans = this.plans.filter(item => item._id.toString() !== id.toString()) // Фільтруємо з списку планів отриманий id
    await this.save(); // Зберігаємо зміни
    return this.plans; // Повертаємо оновлений список для рендерингу в html
};

// Експортуємо модель користувача
module.exports = model('User', UserSchema);
