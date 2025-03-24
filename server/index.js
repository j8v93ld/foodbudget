const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Konfiguracja środowiska
dotenv.config();

// Importowanie kontrolerów
const aiController = require('./controllers/aiController');

// Inicjalizacja aplikacji Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Zwiększony limit dla zdjęć paragonów
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Endpointy API
app.post('/api/analyze-receipt', aiController.analyzeReceipt);
app.post('/api/get-recommendations', aiController.getRecommendations);

// Serwowanie statycznych plików w produkcji
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
