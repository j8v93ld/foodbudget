import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  AttachMoney, 
  Today, 
  SaveAlt, 
  CloudUpload 
} from '@mui/icons-material';
import { BudgetContext } from '../../context/BudgetContext';
import { getItem, importData } from '../../services/localStorageService';

const BudgetForm = () => {
  const { budget, updateBudget, setExpenses } = useContext(BudgetContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    monthlyAmount: '',
    renewalDay: '',
    currentAmount: ''
  });
  
  const [errors, setErrors] = useState({
    monthlyAmount: '',
    renewalDay: '',
    currentAmount: ''
  });
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Wczytanie aktualnych wartości budżetu
  useEffect(() => {
    if (budget) {
      setFormData({
        monthlyAmount: budget.monthlyAmount || '',
        renewalDay: budget.renewalDay || '',
        currentAmount: budget.currentAmount || ''
      });
    }
  }, [budget]);

  // Obsługa zmiany wartości w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Czyszczenie błędu po zmianie wartości
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  // Walidacja formularza
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Walidacja kwoty miesięcznej
    if (!formData.monthlyAmount) {
      newErrors.monthlyAmount = 'Kwota miesięczna jest wymagana';
      valid = false;
    } else if (isNaN(formData.monthlyAmount) || parseFloat(formData.monthlyAmount) <= 0) {
      newErrors.monthlyAmount = 'Kwota musi być liczbą większą od zera';
      valid = false;
    }
    
    // Walidacja dnia odnowienia
    if (!formData.renewalDay) {
      newErrors.renewalDay = 'Dzień odnowienia jest wymagany';
      valid = false;
    } else if (
      isNaN(formData.renewalDay) || 
      parseInt(formData.renewalDay) < 1 || 
      parseInt(formData.renewalDay) > 31
    ) {
      newErrors.renewalDay = 'Dzień musi być liczbą od 1 do 31';
      valid = false;
    }
    
    // Walidacja aktualnej kwoty
    if (!formData.currentAmount) {
      newErrors.currentAmount = 'Aktualna kwota jest wymagana';
      valid = false;
    } else if (isNaN(formData.currentAmount) || parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Kwota musi być liczbą nieujemną';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  // Obsługa zatwierdzenia formularza
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const updatedBudget = {
        monthlyAmount: parseFloat(formData.monthlyAmount),
        renewalDay: parseInt(formData.renewalDay),
        currentAmount: parseFloat(formData.currentAmount)
      };
      
      updateBudget(updatedBudget);
      navigate('/');
    }
  };
  
  // Obsługa importu pliku
const handleImportFile = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    await importData(file);
    
    // Po zaimportowaniu danych, odśwież stan aplikacji
    const savedBudget = getItem('budget');
    const savedExpenses = getItem('expenses');
    
    if (savedBudget) {
      updateBudget(savedBudget);
    }
    
    if (savedExpenses) {
      setExpenses(savedExpenses);
    }
    
    navigate('/'); // Przekieruj do dashboardu po udanym imporcie
  } catch (error) {
    console.error('Błąd podczas importu danych:', error);
    // Możesz dodać wyświetlanie komunikatu o błędzie
  } finally {
    setImportDialogOpen(false);
    // Czyszczenie input file, aby można było zaimportować ten sam plik ponownie
    if (event.target) event.target.value = null;
  }
};

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Ustawienia budżetu żywieniowego
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="monthlyAmount"
                label="Miesięczny budżet na żywność"
                fullWidth
                value={formData.monthlyAmount}
                onChange={handleChange}
                error={!!errors.monthlyAmount}
                helperText={errors.monthlyAmount}
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
                name="renewalDay"
                label="Dzień odnowienia budżetu"
                fullWidth
                value={formData.renewalDay}
                onChange={handleChange}
                error={!!errors.renewalDay}
                helperText={errors.renewalDay || 'Np. dzień wypłaty'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Today />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="currentAmount"
                label="Aktualnie dostępna kwota"
                fullWidth
                value={formData.currentAmount}
                onChange={handleChange}
                error={!!errors.currentAmount}
                helperText={errors.currentAmount}
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
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveAlt />}
            >
              Zapisz ustawienia
            </Button>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              lub
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudUpload />}
              onClick={() => setImportDialogOpen(true)}
            >
              Przywróć z kopii zapasowej
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Dialog import */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import danych</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Wybierz plik z kopią zapasową aplikacji FoodBudget.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Po zaimportowaniu danych, Twoje ustawienia budżetu i historia wydatków zostaną przywrócone.
            </Typography>
          </Box>
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <Button
            variant="contained"
            fullWidth
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current.click()}
          >
            Wybierz plik
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Anuluj</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BudgetForm;
