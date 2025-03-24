import React, { useContext, useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetContext } from '../../context/BudgetContext';
import { groupExpensesByCategory, filterExpensesByDateRange } from '../../utils/budgetUtils';
import { formatDate } from '../../utils/dateUtils';

const ExpenseChart = () => {
  const { expenses, budget } = useContext(BudgetContext);
  const [chartType, setChartType] = useState('daily');
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  
  // Przetwarzanie danych do wykresu
  useEffect(() => {
    if (expenses.length === 0) {
      setChartData([]);
      setCategoryData([]);
      return;
    }
    
    // Obliczenie aktualnego okresu rozliczeniowego
    const today = new Date();
    const renewalDay = budget.renewalDay || 1;
    
    // Data początkowa aktualnego okresu
    let startDate;
    if (today.getDate() >= renewalDay) {
      // Jesteśmy w tym samym miesiącu, ale po dniu odnowienia
      startDate = new Date(today.getFullYear(), today.getMonth(), renewalDay);
    } else {
      // Jesteśmy przed dniem odnowienia, więc okres zaczął się w poprzednim miesiącu
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, renewalDay);
    }
    
    // Data końcowa okresu (dzień przed następnym odnowieniem)
    let endDate;
    if (today.getDate() >= renewalDay) {
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, renewalDay - 1);
    } else {
      endDate = new Date(today.getFullYear(), today.getMonth(), renewalDay - 1);
    }
    
    // Filtrowanie wydatków z aktualnego okresu rozliczeniowego
    const currentPeriodExpenses = filterExpensesByDateRange(expenses, startDate, endDate);
    
    // Grupowanie wydatków według daty (dla wykresu dziennego)
    const dailyExpenses = currentPeriodExpenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.date);
      const dateStr = formatDate(expenseDate);
      if (!acc[dateStr]) {
        acc[dateStr] = 0;
      }
      acc[dateStr] += expense.amount;
      return acc;
    }, {});
    
    // Konwersja do formatu dla wykresu
    const dailyData = Object.entries(dailyExpenses).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => {
      const dateA = a.date.split('-').reverse().join('-');
      const dateB = b.date.split('-').reverse().join('-');
      return new Date(dateA) - new Date(dateB);
    });
    
    setChartData(dailyData);
    
    // Grupowanie wydatków według kategorii
    const categoriesMap = groupExpensesByCategory(currentPeriodExpenses);
    
    // Konwersja do formatu dla wykresu
    const categoriesData = Object.entries(categoriesMap).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);
    
    setCategoryData(categoriesData);
  }, [expenses, chartType, budget.renewalDay]);
  
  // Zmiana typu wykresu
  const handleChartTypeChange = (e, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  // Formatowanie etykiet osi X
  const formatXAxis = (value) => {
    // Pobierz tylko dzień z daty (np. "12" z "12-03-2025")
    return value.split('-')[0];
  };
  
  // Formatowanie tooltipa
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, boxShadow: 1 }}>
          <Typography variant="body2" color="text.primary">
            {label}
          </Typography>
          <Typography variant="body2" color="primary" fontWeight="bold">
            {`${payload[0].value.toFixed(2)} zł`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, height: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Wydatki w tym okresie
        </Typography>
        
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="daily">
            Dzienne
          </ToggleButton>
          <ToggleButton value="category">
            Kategorie
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {expenses.length === 0 ? (
        <Box sx={{ height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Dodaj wydatki, aby zobaczyć wykres
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          {chartType === 'daily' ? (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value} zł`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                name="Wydatki dzienne" 
                stroke="#1976d2" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={categoryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value} zł`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="amount" 
                name="Wydatki" 
                fill="#4caf50" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default ExpenseChart;
