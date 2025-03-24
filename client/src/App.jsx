import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BudgetProvider } from './context/BudgetContext';

// Komponenty
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import BudgetForm from './components/BudgetSetup/BudgetForm';
import ExpenseForm from './components/Expenses/ExpenseForm';
import ExpenseList from './components/Expenses/ExpenseList';
import ReceiptScanner from './components/Receipts/ReceiptScanner';

// Motyw aplikacji
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Wiadomość zostanie użyta przez niektóre przeglądarki – większość jednak wyświetli własny komunikat
      const message = 'Na pewno chcesz odświeżyć stronę? Przy odświeżaniu strony wszystkie dane zostaną skasowane. Zrób eksport danych zanim odświeżysz stronę.';
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BudgetProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget-setup" element={<BudgetForm />} />
            <Route path="/add-expense" element={<ExpenseForm />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/scan-receipt" element={<ReceiptScanner />} />
          </Routes>
        </Router>
      </BudgetProvider>
    </ThemeProvider>
  );
}

export default App;
