import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { BudgetContext } from '../../context/BudgetContext';
import ExpenseItem from './ExpenseItem';
import { groupExpensesByDate } from '../../utils/dateUtils';

const ExpenseList = () => {
  const { expenses } = useContext(BudgetContext);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Lista wszystkich kategorii z wydatków
  const categories = [...new Set(expenses.map(expense => expense.category).filter(Boolean))];
  
  // Filtrowanie wydatków na podstawie wyszukiwania i kategorii
  useEffect(() => {
    let result = [...expenses];
    
    // Filtrowanie po wyszukiwaniu
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(expense => 
        (expense.description && expense.description.toLowerCase().includes(term)) ||
        (expense.shop && expense.shop.toLowerCase().includes(term))
      );
    }
    
    // Filtrowanie po kategorii
    if (filterCategory) {
      result = result.filter(expense => expense.category === filterCategory);
    }
    
    // Sortowanie po dacie (od najnowszych)
    result = result.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredExpenses(result);
  }, [expenses, searchTerm, filterCategory]);
  
  // Grupowanie wydatków według daty
  const groupedExpenses = groupExpensesByDate(filteredExpenses);
  
  // Obsługa zmiany wyszukiwania
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Obsługa zmiany filtra kategorii
  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Lista wydatków
        </Typography>
        
        {/* Filtry i wyszukiwanie */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Szukaj"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="category-filter-label">Kategoria</InputLabel>
            <Select
              labelId="category-filter-label"
              value={filterCategory}
              onChange={handleCategoryChange}
              label="Kategoria"
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              }
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Lista wydatków */}
        {Object.keys(groupedExpenses).length > 0 ? (
          Object.entries(groupedExpenses)
            .sort(([dateA], [dateB]) => new Date(dateB.split('-').reverse().join('-')) - new Date(dateA.split('-').reverse().join('-')))
            .map(([date, expensesForDate]) => (
              <Box key={date} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {date}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {expensesForDate.map(expense => (
                    <ListItem key={expense.id} disableGutters sx={{ display: 'block', py: 0 }}>
                      <ExpenseItem expense={expense} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))
        ) : (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            Brak wydatków spełniających kryteria
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ExpenseList;
