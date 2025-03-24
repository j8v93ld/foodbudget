import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { AttachMoney, Receipt, Description, Category, CalendarMonth, SaveAlt } from '@mui/icons-material';
import { BudgetContext } from '../../context/BudgetContext';

// Kategorie wydatków
const EXPENSE_CATEGORIES = [
  'Pieczywo',
  'Nabiał',
  'Mięso',
  'Owoce',
  'Warzywa',
  'Napoje',
  'Przekąski',
  'Gotowe dania',
  'Restauracja',
  'Inne'
];

const ExpenseForm = () => {
  const { addExpense } = useContext(BudgetContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0], // Dzisiejsza data w formacie YYYY-MM-DD
    category: '',
    description: '',
    shop: '',
    duration: '', // Na ile dni wystarczy (dla zakupów)
  });
  
  const [errors, setErrors] = useState({
    amount: '',
    date: '',
    category: ''
  });

  // Obsługa zmiany wartości w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Czyszczenie błędu po zmianie wartości
    if (name in errors) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Walidacja formularza
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Walidacja kwoty
    if (!formData.amount) {
      newErrors.amount = 'Kwota jest wymagana';
      valid = false;
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Kwota musi być liczbą większą od zera';
      valid = false;
    }
    
    // Walidacja daty
    if (!formData.date) {
      newErrors.date = 'Data jest wymagana';
      valid = false;
    }
    
    // Walidacja kategorii
    if (!formData.category) {
      newErrors.category = 'Kategoria jest wymagana';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  // Obsługa zatwierdzenia formularza
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newExpense = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        duration: formData.duration ? parseInt(formData.duration) : null
      };
      
      addExpense(newExpense);
      navigate('/');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Dodaj nowy wydatek
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="amount"
                label="Kwota"
                fullWidth
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">PLN</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="date"
                label="Data"
                type="date"
                fullWidth
                value={formData.date}
                onChange={handleChange}
                error={!!errors.date}
                helperText={errors.date}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel id="category-label">Kategoria</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <Category />
                    </InputAdornment>
                  }
                >
                  {EXPENSE_CATEGORIES.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Opis"
                fullWidth
                value={formData.description}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="shop"
                label="Sklep/Restauracja"
                fullWidth
                value={formData.shop}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Receipt />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="duration"
                label="Na ile dni wystarczy?"
                fullWidth
                value={formData.duration}
                onChange={handleChange}
                helperText="Opcjonalne, dla zakupów spożywczych"
                type="number"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveAlt />}
            >
              Zapisz wydatek
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ExpenseForm;
