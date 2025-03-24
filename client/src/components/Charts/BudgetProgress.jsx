import React, { useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip
} from '@mui/material';
import { BudgetContext } from '../../context/BudgetContext';
import { forecastExpenses, calculateBudgetUsagePercentage } from '../../utils/budgetUtils';
import { getDaysUntilRenewal } from '../../utils/dateUtils';

const BudgetProgress = () => {
  const { budget, expenses } = useContext(BudgetContext);
  
  // Jeśli nie ma jeszcze budżetu, wyświetl komunikat
  if (!budget.monthlyAmount) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Postęp budżetu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ustaw swój miesięczny budżet, aby zobaczyć jego wykorzystanie.
        </Typography>
      </Paper>
    );
  }
  
  // Obliczenie prognozy wydatków
  const forecast = forecastExpenses(expenses, budget);
  
  // Obliczenie procentowego wykorzystania budżetu (aktualnego i prognozowanego)
  const currentPercentage = calculateBudgetUsagePercentage(
    budget.monthlyAmount - budget.currentAmount,
    budget.monthlyAmount
  );
  
  const forecastedPercentage = calculateBudgetUsagePercentage(
    forecast.forecastedTotalExpenses,
    budget.monthlyAmount
  );
  
  // Określenie koloru na podstawie procentu wykorzystania
  const getProgressColor = (percentage) => {
    if (percentage <= 60) return 'success';
    if (percentage <= 85) return 'warning';
    return 'error';
  };
  
  // Liczba dni do odnowienia budżetu
  const daysUntilRenewal = getDaysUntilRenewal(budget.renewalDay);
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Aktualny budżet
        </Typography>
        <Chip 
          label={`${daysUntilRenewal} dni do odnowienia`} 
          color="info" 
          variant="outlined" 
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Aktualnie wykorzystane
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {budget.monthlyAmount - budget.currentAmount} / {budget.monthlyAmount} zł
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={currentPercentage} 
          color={getProgressColor(currentPercentage)} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Prognoza do końca okresu
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {forecast.forecastedTotalExpenses.toFixed(2)} / {budget.monthlyAmount} zł
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={forecastedPercentage} 
          color={getProgressColor(forecastedPercentage)} 
          sx={{ height: 10, borderRadius: 5 }}
        />
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Prognozowana pozostała kwota:
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight="bold"
            color={forecast.forecastedRemainingBudget < 0 ? 'error.main' : 'success.main'}
          >
            {forecast.forecastedRemainingBudget.toFixed(2)} zł
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default BudgetProgress;
