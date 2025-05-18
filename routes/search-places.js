const { Router } = require("express");
const router = Router();
require("dotenv").config();

const apiKey = process.env.GOOGLE_API_KEY;

const categoriesMap = {
  lodging: "hotel",
  museum: "museum",
  landmark: "point_of_interest",
  shopping_mall: "shopping_mall",
  night_club: "night_club",
};

// Маршрут для автодоповнення міст
router.get("/autocomplete", async (req, res) => {
  const query = req.query.query || "";
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.json([]);
    }

    // Форматуємо результати автодоповнення
    const suggestions = data.predictions.map(prediction => ({
      description: prediction.description,
      place_id: prediction.place_id,
    }));

    res.json(suggestions);
  } catch (error) {
    console.error("Помилка автодоповнення:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

// Обробник маршруту для пошуку місць
router.get("/search-places", async (req, res) => {
  const location = req.query.location || "Київ";
  const category = req.query.category || "lodging";
  const placeName = `${location} ${categoriesMap[category] || "hotel"}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.json({ error: "Місця не знайдено" });
    }

    const places = data.results.map(place => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || "Немає рейтингу",
      totalRatings: place.user_ratings_total || 0,
      photoUrl: place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
        : "/images/placeholder.jpg",
      arr: place,
    }));

    res.json(places);
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});

module.exports = router;