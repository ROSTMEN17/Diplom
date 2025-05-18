// Додаємо обробник події на відправку форми (пошук місць)
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault(); // Відміняємо стандартну поведінку форми (оновлення сторінки)
  searchPlaces(); // Викликаємо функцію пошуку місць
});

// Додаємо обробники подій для всіх кнопок вкладок
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", function () {
    // Видаляємо клас "active" у всіх кнопок і панелей вкладок
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));

    // Додаємо клас "active" лише для натиснутої кнопки та відповідної панелі
    this.classList.add("active");
    document.getElementById(this.dataset.tab).classList.add("active");

    // Запускаємо пошук місць для обраної категорії
    searchPlaces();
  });
});

// Ініціалізація автодоповнення
const locationInput = document.querySelector("#location");
const dropdown = document.querySelector("#autocomplete-dropdown");

locationInput.addEventListener("input", async () => {
  const query = locationInput.value.trim();
  if (query.length < 1) {
    dropdown.style.display = "none";
    return;
  }

  // Показуємо індикатор завантаження
  dropdown.innerHTML = "<div style='padding: 8px;'>🔄 Завантаження...</div>";
  dropdown.style.display = "block";

  try {
    const response = await fetch(`/search/autocomplete?query=${encodeURIComponent(query)}`);
    const suggestions = await response.json();

    dropdown.innerHTML = "";
    if (suggestions.length === 0) {
      dropdown.style.display = "none";
      return;
    }

    suggestions.forEach(suggestion => {
      const item = document.createElement("div");
      item.textContent = suggestion.description;
      item.addEventListener("click", () => {
        locationInput.value = suggestion.description;
        dropdown.style.display = "none";
        searchPlaces();
      });
      dropdown.appendChild(item);
    });

    dropdown.style.display = "block";
  } catch (error) {
    console.error("Помилка автодоповнення:", error);
    dropdown.innerHTML = "<div style='padding: 8px; color: red;'>⚠️ Помилка при запиті</div>";
  }
});

// Закриваємо дропдаун при кліку поза ним
document.addEventListener("click", (e) => {
  if (!locationInput.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});

// Функція для пошуку місць через API
function searchPlaces() {
  let location = document.querySelector("#location").value.trim(); // Отримуємо значення локації з поля вводу
  let activeTabButton = document.querySelector(".tab-button.active"); // Знаходимо активну вкладку
  let category = activeTabButton ? activeTabButton.getAttribute("data-category") : "lodging"; // Отримуємо категорію (за замовчуванням "lodging")
  // Показуємо loading
  const loading = document.querySelector(`#${activeTabButton.dataset.tab} .loading`);
  const container = document.querySelector(`#${activeTabButton.dataset.tab}-list`);
  if (loading && container) {
    loading.style.display = "block";
    container.innerHTML = ""; // очищаємо попередні результати
  }
  // Виконуємо запит на сервер для отримання списку місць
  fetch(`/search/search-places?location=${encodeURIComponent(location)}&category=${category}`)
    .then(response => response.json()) // Розбираємо відповідь
    .then(places => {
      const container = document.querySelector(`#${activeTabButton.dataset.tab}-list`); // Знаходимо контейнер для відображення місць
      if (!container) return;
      if (loading) loading.style.display = "none";

      container.innerHTML = ""; // Очищаємо контейнер перед оновленням

      if (places.error) {
        container.innerHTML = `<p>${places.error}</p>`; // Виводимо повідомлення про помилку, якщо місць немає
        return;
      }

      // Проходимо по кожному знайденому місцю та створюємо HTML-елемент
      places.forEach(place => {
        const formattedAddress = formatAddress(place.address); // Форматуємо адресу
        const card = document.createElement("div"); // Створюємо контейнер для місця
        card.classList.add("card"); // Додаємо клас для стилізації

        // Створюємо кнопку "Додати в план"
        const btnAddToPlan = document.createElement("button");
        btnAddToPlan.classList.add("btn-secondary");
        btnAddToPlan.textContent = "+ в план";

        // Додаємо обробник події для кнопки "Додати в план"
        btnAddToPlan.addEventListener("click", async () => {
          try {
            const response = await fetch("/add-to-plan", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                photoUrl: place.photoUrl,
                name: place.name,
                address: formattedAddress,
              }),
            });

            const result = await response.json(); // Отримуємо відповідь сервера

            if (response.ok) {
              alert("Додано в план!"); // Якщо успішно - виводимо повідомлення
            } else {
              alert("Увійдіть в систему"); // Виводимо помилку
            }
          } catch (error) {
            console.error("Помилка запиту:", error);
            if (loading) loading.style.display = "none";
            alert("Сталася помилка, спробуйте ще раз.");
          }
        });

        // Заповнюємо картку інформацією про місце
        card.innerHTML = `
          <img src="${place.photoUrl}" alt="${place.name}" onerror="this.src='/images/placeholder.png'"> 
          <h3>${place.name}</h3>
          <p>${formattedAddress}</p>
          <p>Рейтинг: ${place.rating || "Немає рейтингу"} (${place.totalRatings || 0} відгуків)</p>
        `;

        card.appendChild(btnAddToPlan); // Додаємо кнопку "Додати в план" у картку
        container.appendChild(card); // Додаємо картку в контейнер
      });
    })
    .catch(error => console.error("Помилка завантаження:", error)); // Виводимо помилку
}

// Функція для форматування адреси (залишає тільки перші два елементи, щоб не показувати індекс, країну і тп.)
function formatAddress(fullAddress) {
  const parts = fullAddress.split(", "); // Розбиваємо адресу по комах
  return parts.length >= 3 ? `${parts[0]}, ${parts[1]}` : fullAddress; // Якщо є хоча б 3 частини, повертаємо перші дві
}