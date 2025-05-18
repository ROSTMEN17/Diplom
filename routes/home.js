const { Router } = require("express"); // Імпортуємо Router з Express
const router = Router(); // Створюємо екземпляр роутера

// Головна сторінка 
router.get("/", (req, res) => {
  res.render("home", { // Рендеримо шаблон 'home.hbs'
    title: "Планувальник подорожей", // Передаємо заголовок сторінки
  });
});

module.exports = router; // Експортуємо роутер
