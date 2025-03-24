import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  AlertTitle,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  CameraAlt,
  Delete,
  Save,
  PhotoLibrary,
  RestartAlt
} from '@mui/icons-material';
import { BudgetContext } from '../../context/BudgetContext';
import { analyzeReceipt } from '../../services/aiService';

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

/**
 * Ujednolica kategorię:
 *  - Wielka litera na początku, reszta małe.
 *  - Jeśli nie pasuje do listy EXPENSE_CATEGORIES, ustawia "Inne".
 */
const fixCategory = (category) => {
  if (!category) return 'Inne';
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return EXPENSE_CATEGORIES.includes(capitalized) ? capitalized : 'Inne';
};

const ReceiptScanner = () => {
  const { addExpense } = useContext(BudgetContext);
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [duration, setDuration] = useState('');

  // Obsługa wczytania obrazu
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset stanu
    setError('');
    setReceiptData(null);

    // Sprawdzenie typu pliku
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Nieprawidłowy format pliku. Obsługiwane formaty: JPG, PNG');
      return;
    }

    // Wczytanie podglądu obrazu
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Analiza paragonu
  const handleAnalyzeReceipt = async () => {
    if (!previewImage) {
      setError('Najpierw dodaj zdjęcie paragonu');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzeReceipt(previewImage);

      if (result.success && result.data) {
        // Ujednolicamy kategorie tuż po wczytaniu danych
        const fixedItems = (result.data.items || []).map((item) => ({
          ...item,
          category: fixCategory(item.category)
        }));

        setReceiptData({
          ...result.data,
          items: fixedItems
        });
      } else {
        setError('Błąd analizy paragonu: ' + (result.error || 'Nieznany błąd'));
      }
    } catch (err) {
      setError('Błąd podczas komunikacji z serwerem: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Edycja pozycji paragonu
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receiptData.items];

    // Jeśli zmieniamy kategorię, również ujednolicamy
    if (field === 'category') {
      value = fixCategory(value);
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setReceiptData({
      ...receiptData,
      items: updatedItems
    });
  };

  // Usunięcie pozycji paragonu
  const handleRemoveItem = (index) => {
    const updatedItems = receiptData.items.filter((_, i) => i !== index);

    setReceiptData({
      ...receiptData,
      items: updatedItems
    });
  };

  // Edycja danych paragonu (np. kwota, data, sklep)
  const handleReceiptDataChange = (field, value) => {
    setReceiptData({
      ...receiptData,
      [field]: value
    });
  };

  /**
   * Zapisanie paragonu: zamiast jednego wydatku,
   * tworzymy osobny wydatek dla każdego produktu z paragonu.
   */
  const handleSaveReceipt = () => {
    if (!receiptData || !receiptData.items || !receiptData.items.length) {
      setError('Brak produktów w paragonie – nie można zapisać.');
      return;
    }

    // Dodajemy do listy wydatków *każdy* produkt jako osobny wydatek
    receiptData.items.forEach((item) => {
      const singleExpense = {
        // Kwota = cena danego produktu
        amount: parseFloat(item.price),
        // Data i pozostałe pola z paragonu
        date: receiptData.date ? new Date(receiptData.date) : new Date(),
        category: item.category,
        description: item.name,  // opis = nazwa produktu
        shop: receiptData.store || '',
        duration: duration ? parseInt(duration) : null
      };
      addExpense(singleExpense);
    });

    // Po dodaniu wszystkich pozycji przechodzimy na stronę główną
    navigate('/');
  };

  // Reset stanu
  const handleReset = () => {
    setPreviewImage(null);
    setReceiptData(null);
    setError('');
    setDuration('');
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Skanowanie paragonu
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Błąd</AlertTitle>
            {error}
          </Alert>
        )}

        {!receiptData && (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="receipt-image-upload"
              type="file"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
            />
            <label htmlFor="receipt-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CameraAlt />}
                sx={{ mr: 2 }}
                disabled={isAnalyzing}
              >
                Zrób zdjęcie
              </Button>
            </label>
            <label htmlFor="receipt-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoLibrary />}
                disabled={isAnalyzing}
              >
                Wybierz z galerii
              </Button>
            </label>

            {previewImage && (
              <Box sx={{ mt: 3, position: 'relative' }}>
                <img
                  src={previewImage}
                  alt="Podgląd paragonu"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    display: 'block',
                    margin: '0 auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAnalyzeReceipt}
                    disabled={isAnalyzing}
                    startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {isAnalyzing ? 'Analizuję...' : 'Analizuj paragon'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    disabled={isAnalyzing}
                    startIcon={<RestartAlt />}
                  >
                    Resetuj
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {receiptData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wyniki analizy paragonu
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Kwota całkowita"
                  fullWidth
                  value={receiptData.total || ''}
                  onChange={(e) => handleReceiptDataChange('total', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">PLN</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Sklep/Restauracja"
                  fullWidth
                  value={receiptData.store || ''}
                  onChange={(e) => handleReceiptDataChange('store', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Data"
                  type="date"
                  fullWidth
                  value={receiptData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleReceiptDataChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Na ile dni wystarczy?"
                  fullWidth
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  helperText="Opcjonalne, dla zakupów spożywczych"
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom>
              Lista produktów
            </Typography>

            <List>
              {receiptData.items && receiptData.items.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="Nazwa produktu"
                          fullWidth
                          value={item.name || ''}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="Cena"
                          fullWidth
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">PLN</InputAdornment>
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <TextField
                          label="Kategoria"
                          fullWidth
                          select
                          value={item.category || ''}
                          onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          size="small"
                        >
                          {EXPENSE_CATEGORIES.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSaveReceipt}
                sx={{ mr: 2 }}
              >
                Zapisz wydatek
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RestartAlt />}
                onClick={handleReset}
              >
                Zacznij od nowa
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ReceiptScanner;
