const axios = require('axios');
const OpenAI = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');

// Inicjalizacja klientów API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

/**
 * Analizuje zdjęcie paragonu za pomocą modelu GPT-4 Vision
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
exports.analyzeReceipt = async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, error: 'Brak obrazu paragonu' });
    }

    // Prompt dla modelu GPT-4
    const prompt = `
      Analizujesz zdjęcie paragonu. Proszę zwróć następujące informacje w formacie JSON:
      
      1. Ogólna kwota paragonu (suma)
      2. Nazwa sklepu lub restauracji
      3. Data zakupu
      4. Lista wszystkich produktów wraz z ich cenami i kategoriami
      
      Format odpowiedzi:
      {
        "total": "kwota całkowita",
        "store": "nazwa sklepu",
        "date": "data zakupu w formacie YYYY-MM-DD",
        "items": [
          {
            "name": "nazwa produktu",
            "price": "cena jako liczba",
            "category": "jedna z kategorii: pieczywo, nabiał, mięso, owoce, warzywa, napoje, przekąski, gotowe dania, inne"
          }
        ]
      }
      
      Jeśli któraś informacja jest nieczytelna lub niedostępna, użyj wartości null.
      
      Ważne: Upewnij się, że dane są zgodne z formatem JSON i są gotowe do parsowania.
    `;

    // Wywołanie API GPT-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Aktualny model obsługujący analizę obrazów
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4096
    });
    
    // Ekstrakcja odpowiedzi i próba parsowania JSON
    let result;
    try {
      // Pobieranie tekstu odpowiedzi
      const jsonStr = response.choices[0].message.content;
      console.log("Surowa odpowiedź z API:", jsonStr); // Dodajemy logowanie dla debugowania
      
      // Próba wydobycia JSON z odpowiedzi tekstowej
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      const cleanJsonStr = jsonMatch ? jsonMatch[0] : jsonStr;
      
      result = JSON.parse(cleanJsonStr);
    } catch (e) {
      console.error("Błąd parsowania JSON:", e);
      // Jeśli parsowanie się nie powiedzie, zwróć oryginalną odpowiedź
      result = { 
        rawResponse: response.choices[0].message.content,
        parseError: e.message
      };
    }
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Błąd analizy paragonu:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd analizy paragonu',
      details: error.message
    });
  }
};

/**
 * Generuje rekomendacje dotyczące budżetu na podstawie danych o wydatkach
 * @param {Object} req - Obiekt żądania Express
 * @param {Object} res - Obiekt odpowiedzi Express
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { expenses, budget, remainingBudget } = req.body;
    
    if (!expenses || !budget) {
      return res.status(400).json({ success: false, error: 'Brak danych o wydatkach lub budżecie' });
    }

    // Przygotowanie danych dla bardziej użytecznej analizy
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Inne';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {});

    // Sortowanie kategorii wydatków od najwyższych do najniższych
    const sortedCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount }));

const prompt = `
  Przeglądasz dane dotyczące wydatków na żywność użytkownika. Oto informacje:
  
  1. Miesięczny budżet na żywność: ${budget} PLN
  2. Pozostały budżet na ten miesiąc: ${remainingBudget} PLN
  3. Wydatki według kategorii:
     ${sortedCategories.map(c => `- ${c.category}: ${c.amount.toFixed(2)} PLN`).join('\n     ')}
  4. Szczegółowa historia ostatnich wydatków:
     ${expenses.slice(0, 10).map(e => `- ${e.description || e.category || 'Zakup'} (${e.shop || 'Sklep'}): ${e.amount.toFixed(2)} PLN`).join('\n     ')}
  
  Na podstawie tych danych, napisz spersonalizowane rekomendacje.
  
  Ważne zasady:
  1. Zwracaj się bezpośrednio do użytkownika w drugiej osobie (np. "Przekroczyłeś", "Możesz", "Twój budżet" zamiast "Użytkownik przekroczył")
  2. Nie używaj gwiazdek (**) do oznaczania pogrubienia
  3. Bądź konkretny i praktyczny w swoich sugestiach
  4. Odpowiedz w języku polskim
  
  Format odpowiedzi:
  1. Jedno zdanie podsumowania sytuacji budżetowej (maksymalnie 2 wiersze)
  2. Następnie podaj 5 oddzielnych rekomendacji, każdą w osobnym akapicie, zaczynającą się od czasownika (np. "Rozważ...", "Ogranicz...", "Wypróbuj...")
  3. WAŻNE: Każdą rekomendację zacznij od nowego wiersza i oznacz numerem (np. "1. Rozważ...", "2. Ogranicz...")
  
  Staraj się, aby cała odpowiedź była zwięzła i konkretna.
`;


    // Użycie OpenAI API do generowania rekomendacji zamiast Claude
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 1000
    });
    
    const recommendation = response.choices[0].message.content;
    
    res.json({
      success: true,
      data: recommendation
    });
    
  } catch (error) {
    console.error('Błąd generowania rekomendacji:', error);
    res.status(500).json({
      success: false,
      error: 'Błąd generowania rekomendacji',
      details: error.message
    });
  }
};
