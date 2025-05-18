const { Router } = require("express"); // Імпортуємо Router з Express
const router = Router(); // Створюємо екземпляр роутера

// Сторінка "Мої плани"
router.get("/my-plans", (req, res) => {
  // Отримуємо та формуємо новий масив планів користувача (для очищення від методів mongoose та нормальної роботи handlebars)
  const plans = req.user.plans.map(item => ({
    name: item.name,       // Назва місця
    address: item.address, // Адреса місця
    image: item.image,     // URL зображення
    id: item._id           // Id місця
  }));

  // Рендеримо сторінку "my-plans.hbs" з переданими даними
  res.render("my-plans", {
    title: "Мої плани",               // Заголовок сторінки
    plans                             // Передаємо масив планів подорожей користувача
  });
});

// Додавання місця до плану
router.post("/add-to-plan", async (req, res) => {
  try {
    const { photoUrl, name, address } = req.body; // Отримуємо дані з тіла запиту

    await req.user.addToPlan(photoUrl, name, address); // Викликаємо метод для додавання місця

    res.json({ message: "Місце додано в план!" }); // Відповідаємо повідомленням
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" }); // Відправляємо помилку у разі збою
  }
});

// Видалення місця з плану
router.delete("/remove-plan/:id", async (req, res) => {
  res.json(await req.user.removePlan(req.params.id)); // Видаляємо місце за ID та повертаємо оновлений список
});

module.exports = router; // Експортуємо роутер
