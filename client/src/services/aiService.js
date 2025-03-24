import axios from 'axios';

/**
 * Analizuje zdjęcie paragonu za pomocą API AI
 * @param {string} imageBase64 - Obraz paragonu w formacie base64
 * @returns {Promise<Object>} - Przetworzone dane z paragonu
 */
export const analyzeReceipt = async (imageBase64) => {
  try {
    const response = await axios.post('/api/analyze-receipt', {
      image: imageBase64
    });
    
    return response.data;
  } catch (error) {
    console.error('Błąd podczas analizy paragonu:', error);
    throw error;
  }
};

/**
 * Pobiera rekomendacje dotyczące budżetu na podstawie historii wydatków
 * @param {Array} expenses - Historia wydatków
 * @param {number} budget - Miesięczny budżet
 * @param {number} remainingBudget - Pozostały budżet
 * @returns {Promise<string>} - Rekomendacje jako tekst
 */
export const getRecommendations = async (expenses, budget, remainingBudget) => {
  try {
    const response = await axios.post('/api/get-recommendations', {
      expenses,
      budget,
      remainingBudget
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Błąd podczas pobierania rekomendacji:', error);
    throw error;
  }
};
