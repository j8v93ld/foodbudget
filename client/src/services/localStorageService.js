/**
 * Pobiera dane z localStorage
 * @param {string} key - Klucz pod którym dane są przechowywane
 * @returns {any} - Odczytane dane lub null jeśli brak danych
 */
export const getItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Błąd podczas odczytywania ${key} z localStorage:`, error);
    return null;
  }
};

/**
 * Zapisuje dane do localStorage
 * @param {string} key - Klucz pod którym dane będą przechowywane
 * @param {any} value - Dane do zapisania
 * @returns {boolean} - Status powodzenia operacji
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Błąd podczas zapisywania ${key} do localStorage:`, error);
    return false;
  }
};

/**
 * Usuwa dane z localStorage
 * @param {string} key - Klucz pod którym dane są przechowywane
 * @returns {boolean} - Status powodzenia operacji
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Błąd podczas usuwania ${key} z localStorage:`, error);
    return false;
  }
};

/**
 * Czyści całe localStorage
 * @returns {boolean} - Status powodzenia operacji
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Błąd podczas czyszczenia localStorage:', error);
    return false;
  }
};

/**
 * Eksportuje dane z localStorage do pliku JSON
 * @returns {string} - URL do pobrania pliku
 */
export const exportData = () => {
  try {
    const data = {
      budget: getItem('budget'),
      expenses: getItem('expenses')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Błąd podczas eksportu danych:', error);
    return null;
  }
};

/**
 * Importuje dane z pliku JSON do localStorage
 * @param {File} file - Plik JSON z danymi
 * @returns {Promise<boolean>} - Status powodzenia operacji
 */
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.budget) {
          setItem('budget', data.budget);
        }
        
        if (data.expenses) {
          setItem('expenses', data.expenses);
        }
        
        resolve(true);
      } catch (error) {
        console.error('Błąd podczas importu danych:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Błąd podczas odczytu pliku:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};
