/**
 * Formatuje datę do formatu DD-MM-YYYY
 * @param {Date|string} date - Data do sformatowania
 * @returns {string} - Sformatowana data
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Zwraca pierwszy dzień bieżącego miesiąca
 * @returns {Date} - Pierwszy dzień miesiąca
 */
export const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Zwraca ostatni dzień bieżącego miesiąca
 * @returns {Date} - Ostatni dzień miesiąca
 */
export const getLastDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

/**
 * Oblicza liczbę dni do następnego odnowienia budżetu
 * @param {number} renewalDay - Dzień miesiąca, w którym odnawia się budżet
 * @returns {number} - Liczba dni do odnowienia budżetu
 */
export const getDaysUntilRenewal = (renewalDay) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let nextRenewalDate;
  
  if (currentDay < renewalDay) {
    // Odnowienie nastąpi jeszcze w tym miesiącu
    nextRenewalDate = new Date(currentYear, currentMonth, renewalDay);
  } else {
    // Odnowienie nastąpi w następnym miesiącu
    nextRenewalDate = new Date(currentYear, currentMonth + 1, renewalDay);
  }
  
  // Obliczenie różnicy w dniach
  const differenceInTime = nextRenewalDate.getTime() - today.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};

/**
 * Grupuje wydatki według daty
 * @param {Array} expenses - Lista wydatków
 * @returns {Object} - Wydatki pogrupowane według daty
 */
export const groupExpensesByDate = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const date = formatDate(expense.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});
};

/**
 * Grupuje wydatki według kategorii
 * @param {Array} expenses - Lista wydatków
 * @returns {Object} - Wydatki pogrupowane według kategorii
 */
export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category || 'Inne';
    if (!groups[category]) {
      groups[category] = 0;
    }
    groups[category] += expense.amount;
    return groups;
  }, {});
};
