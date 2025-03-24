import { getFirstDayOfMonth, getLastDayOfMonth, getDaysUntilRenewal } from './dateUtils';

/**
 * Oblicza sumę wydatków z określonego okresu
 * @param {Array} expenses - Lista wydatków
 * @param {Date} startDate - Data początkowa
 * @param {Date} endDate - Data końcowa
 * @returns {number} - Suma wydatków
 */
export const calculateTotalExpenses = (expenses, startDate = null, endDate = null) => {
  const filteredExpenses = filterExpensesByDateRange(expenses, startDate, endDate);
  return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Filtruje wydatki według zakresu dat
 * @param {Array} expenses - Lista wydatków
 * @param {Date} startDate - Data początkowa
 * @param {Date} endDate - Data końcowa
 * @returns {Array} - Przefiltrowane wydatki
 */
export const filterExpensesByDateRange = (expenses, startDate = null, endDate = null) => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    
    if (startDate && endDate) {
      return expenseDate >= startDate && expenseDate <= endDate;
    } else if (startDate) {
      return expenseDate >= startDate;
    } else if (endDate) {
      return expenseDate <= endDate;
    }
    
    return true;
  });
};

/**
 * Oblicza średnie dzienne wydatki
 * @param {Array} expenses - Lista wydatków
 * @param {Date} startDate - Data początkowa
 * @param {Date} endDate - Data końcowa
 * @returns {number} - Średnie dzienne wydatki
 */
export const calculateDailyAverage = (expenses, startDate = null, endDate = null) => {
  const filteredExpenses = filterExpensesByDateRange(expenses, startDate, endDate);
  
  if (filteredExpenses.length === 0) {
    return 0;
  }
  
  const total = calculateTotalExpenses(filteredExpenses);
  
  // Jeśli nie podano zakresu dat, używamy dat z wydatków
  if (!startDate || !endDate) {
    const dates = filteredExpenses.map(e => new Date(e.date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Obliczamy liczbę dni
    const daysDiff = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
    return total / daysDiff;
  }
  
  // Obliczamy liczbę dni w podanym zakresie
  const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
  return total / daysDiff;
};

/**
 * Prognozuje wydatki do końca okresu budżetowego
 * @param {Array} expenses - Lista wydatków
 * @param {Object} budget - Obiekt budżetu
 * @returns {Object} - Prognoza wydatków
 */
export const forecastExpenses = (expenses, budget) => {
  const today = new Date();
  const renewalDay = budget.renewalDay;
  
  // Obliczamy datę ostatniego odnowienia budżetu
  let lastRenewalDate;
  if (today.getDate() >= renewalDay) {
    // Ostatnie odnowienie było w tym miesiącu
    lastRenewalDate = new Date(today.getFullYear(), today.getMonth(), renewalDay);
  } else {
    // Ostatnie odnowienie było w poprzednim miesiącu
    lastRenewalDate = new Date(today.getFullYear(), today.getMonth() - 1, renewalDay);
  }
  
  // Obliczamy datę następnego odnowienia budżetu
  let nextRenewalDate;
  if (today.getDate() < renewalDay) {
    // Następne odnowienie będzie w tym miesiącu
    nextRenewalDate = new Date(today.getFullYear(), today.getMonth(), renewalDay);
  } else {
    // Następne odnowienie będzie w następnym miesiącu
    nextRenewalDate = new Date(today.getFullYear(), today.getMonth() + 1, renewalDay);
  }
  
  // Filtrujemy wydatki od ostatniego odnowienia
  const expensesSinceLastRenewal = filterExpensesByDateRange(expenses, lastRenewalDate, today);
  
  // Obliczamy średnie dzienne wydatki
  const averageDailyExpense = calculateDailyAverage(expensesSinceLastRenewal, lastRenewalDate, today);
  
  // Obliczamy liczbę dni do następnego odnowienia
  const daysUntilRenewal = getDaysUntilRenewal(renewalDay);
  
  // Prognozowane wydatki do końca okresu
  const forecastedAdditionalExpenses = averageDailyExpense * daysUntilRenewal;
  
  // Suma aktualnych wydatków od ostatniego odnowienia
  const currentExpenses = calculateTotalExpenses(expensesSinceLastRenewal);
  
  // Prognozowane całkowite wydatki w okresie
  const forecastedTotalExpenses = currentExpenses + forecastedAdditionalExpenses;
  
  // Prognozowana pozostała kwota na koniec okresu
  const forecastedRemainingBudget = budget.currentAmount - forecastedAdditionalExpenses;
  
  return {
    currentExpenses,
    averageDailyExpense,
    daysUntilRenewal,
    forecastedAdditionalExpenses,
    forecastedTotalExpenses,
    forecastedRemainingBudget
  };
};

/**
 * Oblicza procent wykorzystania budżetu
 * @param {number} expenses - Suma wydatków
 * @param {number} budgetAmount - Kwota budżetu
 * @returns {number} - Procent wykorzystania budżetu
 */
export const calculateBudgetUsagePercentage = (expenses, budgetAmount) => {
  if (budgetAmount <= 0) {
    return 100;
  }
  
  return Math.min(100, Math.max(0, (expenses / budgetAmount) * 100));
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
