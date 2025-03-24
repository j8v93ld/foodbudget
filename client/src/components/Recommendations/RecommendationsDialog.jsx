import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Lightbulb, 
  Savings, 
  TrendingDown,
  Check,
  ErrorOutline
} from '@mui/icons-material';
import { getRecommendations } from '../../services/aiService';

const RecommendationsDialog = ({ open, onClose, expenses, budget }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pobiera rekomendacje z API
  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getRecommendations(
        expenses, 
        budget.monthlyAmount,
        budget.currentAmount
      );
      
      setRecommendations(response);
    } catch (err) {
      console.error('Błąd podczas pobierania rekomendacji:', err);
      setError('Nie udało się pobrać rekomendacji. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  // Inicjalizacja pobierania rekomendacji przy otwarciu okna dialogowego
  React.useEffect(() => {
    if (open && !recommendations && !loading) {
      fetchRecommendations();
    }
  }, [open, recommendations, loading]);

// Formatowanie rekomendacji w bardziej przystępny sposób
const formatRecommendations = (text) => {
  if (!text) return [];
  
  // Najpierw spróbujmy znaleźć numerowane punkty (np. "1. ", "2. ")
  const numberedPattern = /\d+\.\s+([^\n]+)/g;
  let matches = [...text.matchAll(numberedPattern)];
  
  if (matches.length > 1) {
    return matches.map(match => match[1].trim());
  }
  
  // Jeśli nie znaleźliśmy numeracji, podzielmy po typowych rozpoczęciach rekomendacji
  const recommendationStarters = [
    'Rozważ', 'Ogranicz', 'Wypróbuj', 'Zaplanuj', 'Korzystaj', 
    'Unikaj', 'Szukaj', 'Przygotuj', 'Zastąp', 'Zredukuj', 
    'Zwiększ', 'Kupuj', 'Monitoruj', 'Porównuj'
  ];
  
  const starterPattern = new RegExp(`(^|\\n)(${recommendationStarters.join('|')})`, 'g');
  
  // Podziel tekst używając wyrażenia regularnego, ale zachowaj separator
  const parts = text.split(starterPattern).filter(Boolean);
  
  // Teraz połącz każde wystąpienie startera z następującym tekstem
  const recommendations = [];
  for (let i = 0; i < parts.length; i++) {
    if (recommendationStarters.some(starter => parts[i].startsWith(starter))) {
      // To jest starter, połącz go z następną częścią jeśli istnieje
      if (i + 1 < parts.length && !recommendationStarters.some(starter => parts[i+1].startsWith(starter))) {
        recommendations.push((parts[i] + parts[i+1]).trim());
        i++; // Pomijamy następną część, ponieważ już ją użyliśmy
      } else {
        recommendations.push(parts[i].trim());
      }
    } else if (recommendations.length === 0) {
      // Jeśli nie znaleźliśmy jeszcze żadnych rekomendacji, to może to jest tekst wprowadzający
      continue;
    } else {
      // Dodaj tekst do ostatniej rekomendacji
      recommendations[recommendations.length - 1] += ' ' + parts[i].trim();
    }
  }
  
  // Jeśli nadal nie mamy rekomendacji, podzielmy tekst po akapitach
  if (recommendations.length === 0) {
    return text.split('\n\n')
      .filter(p => p.trim())
      .filter(p => !p.toLowerCase().includes('twoje miesięczne wydatki') && 
                   !p.toLowerCase().includes('analiza twojego budżetu'));
  }
  
  return recommendations;
};

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Lightbulb color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Rekomendacje AI</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Analizuję Twoje wydatki i generuję rekomendacje...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : recommendations ? (
          <Box>
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Savings sx={{ mr: 1 }} />
                <Typography variant="h6">Analiza Twojego budżetu</Typography>
              </Box>
              <Typography variant="body1">
                {recommendations.split('\n\n')[0]}
              </Typography>
            </Paper>
            
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingDown sx={{ mr: 1 }} />
              Propozycje oszczędności
            </Typography>
            
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
  {formatRecommendations(recommendations).map((recommendation, index) => (
    <React.Fragment key={index}>
      <ListItem alignItems="flex-start">
        <ListItemIcon>
          <Check color="success" />
        </ListItemIcon>
        <ListItemText 
          primary={recommendation.replace(/\*\*([^*]+)\*\*/g, '$1')} /* Usuwamy gwiazdki */
          primaryTypographyProps={{ 
            component: 'div',
            sx: { whiteSpace: 'pre-wrap' }
          }}
        />
      </ListItem>
      {index < formatRecommendations(recommendations).length - 1 && <Divider variant="inset" component="li" />}
    </React.Fragment>
  ))}
</List>
            
            <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorOutline fontSize="small" sx={{ mr: 1 }} />
                Rekomendacje są generowane przez sztuczną inteligencję w oparciu o Twoją historię wydatków.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" align="center" py={4}>
            Nie ma jeszcze rekomendacji. Kliknij przycisk, aby je wygenerować.
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        {!loading && (
          <>
            <Button onClick={onClose}>
              Zamknij
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchRecommendations}
              disabled={loading}
              startIcon={<Lightbulb />}
            >
              {recommendations ? 'Odśwież rekomendacje' : 'Generuj rekomendacje'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RecommendationsDialog;
