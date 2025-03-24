import React, { createContext, useState, useEffect } from 'react';
import { getItem, setItem } from '../services/localStorageService';

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  // Stan dla budżetu
  const [budget, setBudget] = useState({
    monthlyAmount: 0,
    renewalDay: 1,
    currentAmount: 0,
  });

  // Stan dla wydatków
  const [expenses, setExpenses] = useState([]);

  // Ładowanie danych z localStorage przy inicjalizacji
  useEffect(() => {
    const savedBudget = getItem('budget');
    const savedExpenses = getItem('expenses');

    if (savedBudget) {
      setBudget(savedBudget);
    }

    if (savedExpenses) {
      setExpenses(savedExpenses);
    }
  }, []);

  // Zapisywanie danych do localStorage przy zmianach
  useEffect(() => {
    setItem('budget', budget);
  }, [budget]);

  useEffect(() => {
    setItem('expenses', expenses);
  }, [expenses]);

  // Funkcja do aktualizacji budżetu
  const updateBudget = (newBudget) => {
    setBudget(newBudget);
  };

  // POPRAWIONA Funkcja do dodawania nowego wydatku
  const addExpense = (newExpense) => {
    // Funkcjonalna forma setState, aby uniknąć problemu z „przeterminowanym” stanem
    setExpenses(prevExpenses => [
      ...prevExpenses,
      { ...newExpense, id: Date.now() }
    ]);
    
    // Również funkcjonalna forma dla budżetu
    setBudget(prevBudget => ({
      ...prevBudget,
      currentAmount: prevBudget.currentAmount - newExpense.amount
    }));
  };

  // POPRAWIONA Funkcja do usuwania wydatku
  const removeExpense = (expenseId) => {
    setExpenses(prevExpenses => {
      const expenseToRemove = prevExpenses.find(exp => exp.id === expenseId);
      if (!expenseToRemove) {
        return prevExpenses; // Jeśli nie ma takiego wydatku, nie zmieniaj stanu
      }
      const updatedExpenses = prevExpenses.filter(exp => exp.id !== expenseId);

      // Aktualizacja budżetu – także funkcjonalnie
      setBudget(prevBudget => ({
        ...prevBudget,
        currentAmount: prevBudget.currentAmount + expenseToRemove.amount
      }));

      return updatedExpenses;
    });
  };

  return (
    <BudgetContext.Provider
      value={{
        budget,
        updateBudget,
        expenses,
        setExpenses,
        addExpense,
        removeExpense
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
