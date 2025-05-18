// Знаходимо контейнер для списку планів
const planList = document.querySelector('#planList')

// Функція для додавання обробників подій на кнопки видалення
function addEventRemove(){
    const btnRemove = document.querySelectorAll('.btn-remove') // Збираємо всі кнопки "Видалити"
    
    // Для кожної кнопки додаємо подію на клік
    btnRemove.forEach((item) => {
        item.addEventListener('click', (event) => {
            removePlan(event.target.id) // Викликаємо функцію видалення плану за id кнопки
        })
    })
}

// Функція для додавання обробників подій на кнопки побудови маршруту
function addEventRoute(){
    const btnRoute = document.querySelectorAll('.btn-route') // Збираємо всі кнопки "Побудувати маршрут"
    
    // Для кожної кнопки додаємо подію на клік
    btnRoute.forEach((item) => {
        item.addEventListener('click', (event) => {
            alert('Дію не задано!') // На разі просто виводимо повідомлення, що дію не визначено
        })
    })
}

// Функція для видалення плану за id
async function removePlan(id){
    // Відправляємо запит на сервер для видалення плану
    fetch(`/remove-plan/${id}`, {
        method: 'DELETE', // Метод DELETE для видалення
        headers: {
            "Content-Type": "application/json", // Вказуємо тип контенту
        },
    })
    .then(res => res.json()) // Отримуємо відповідь від сервера
    .then(data => {
        planList.innerHTML = '' // Очищаємо поточний список планів
        
        // Для кожного плану створюємо новий html елемент
        data.forEach(item => {
            const divPlan = document.createElement('div') // Створюємо новий блок для плану
            divPlan.className = 'plan-card' // Додаємо клас для стилізації
            divPlan.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='/images/placeholder.png'"> 
                <h3>${item.name}</h3>
                <p>${item.address}</p>
                <button class="btn-remove" id="${item._id}">Видалити</button> 
                <button class="btn-route btn-secondary">Побудувати маршрут</button>
            `
            planList.appendChild(divPlan) // Додаємо новий елемент у список
        })

        // Після того, як список оновлений, додаємо обробники подій на нові кнопки
        addEventRoute()
        addEventRemove()
    })
}

// Викликаємо функції для додавання обробників подій на сторінці
addEventRoute() 
addEventRemove()
