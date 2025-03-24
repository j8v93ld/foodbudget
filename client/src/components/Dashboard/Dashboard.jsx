import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  Divider
} from '@mui/material';
import { 
  Add, 
  SettingsOutlined, 
  ReceiptLong, 
  Lightbulb, 
  CloudUpload, 
  CloudDownload 
} from '@mui/icons-material';
import { BudgetContext } from '../../context/BudgetContext';
import BudgetProgress from '../Charts/BudgetProgress';
import ExpenseChart from '../Charts/ExpenseChart';
import ExpenseItem from '../Expenses/ExpenseItem';
import RecommendationsDialog from '../Recommendations/RecommendationsDialog';
import DataImportExport from '../Settings/DataImportExport';

const Dashboard = () => {
  const { budget, expenses } = useContext(BudgetContext);
  const navigate = useNavigate();
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [dataImportExportOpen, setDataImportExportOpen] = useState(false);
  
  // Jeśli budżet nie jest ustawiony, przekieruj do formularza ustawień budżetu
  useEffect(() => {
    if (!budget.monthlyAmount) {
      navigate('/budget-setup');
    }
  }, [budget, navigate]);
  
  // Sortowanie wydatków po dacie (od najnowszych)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Ograniczenie do 5 najnowszych
  const recentExpenses = sortedExpenses.slice(0, 5);
  
  // Otwieranie/zamykanie okna dialogowego z rekomendacjami
  const handleOpenRecommendations = () => {
    setRecommendationsOpen(true);
  };
  
  const handleCloseRecommendations = () => {
    setRecommendationsOpen(false);
  };
  
  // Otwieranie/zamykanie okna dialogowego import/export
  const handleOpenDataImportExport = () => {
    setDataImportExportOpen(true);
  };
  
  const handleCloseDataImportExport = () => {
    setDataImportExportOpen(false);
  };
  
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Górny pasek z przyciskami akcji */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" component="h1">
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Przegląd Twojego budżetu żywieniowego
              </Typography>
            </Box>
            
            <Box>
              <Button
                variant="outlined"
                startIcon={<SettingsOutlined />}
                onClick={() => navigate('/budget-setup')}
                sx={{ mr: 1 }}
              >
                Ustawienia budżetu
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={handleOpenDataImportExport}
                sx={{ mr: 1 }}
              >
                Import/Eksport
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => navigate('/add-expense')}
                sx={{ mr: 1 }}
              >
                Dodaj wydatek
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ReceiptLong />}
                onClick={() => navigate('/scan-receipt')}
              >
                Skanuj paragon
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Sekcja z podsumowaniem budżetu */}
        <Grid item xs={12} md={4}>
          <BudgetProgress />
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Ostatnie wydatki
              </Typography>
              
              {expenses.length > 0 && (
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<Lightbulb />}
                  onClick={handleOpenRecommendations}
                  size="small"
                >
                  Rekomendacje AI
                </Button>
              )}
            </Box>
            
            {recentExpenses.length > 0 ? (
              <List disablePadding>
                {recentExpenses.map((expense, index) => (
                  <React.Fragment key={expense.id}>
                    <ListItem disableGutters sx={{ display: 'block', py: 0 }}>
                      <ExpenseItem expense={expense} />
                    </ListItem>
                    {index < recentExpenses.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button onClick={() => navigate('/expenses')}>
                    Zobacz wszystkie wydatki
                  </Button>
                </Box>
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                Brak wydatków. Dodaj swój pierwszy wydatek.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Sekcja z wykresami */}
        <Grid item xs={12} md={8}>
          <ExpenseChart />
        </Grid>
      </Grid>
      
      {/* Dialog z rekomendacjami */}
      <RecommendationsDialog 
        open={recommendationsOpen} 
        onClose={handleCloseRecommendations} 
        expenses={expenses}
        budget={budget}
      />
      
      {/* Dialog import/export */}
      <DataImportExport
        open={dataImportExportOpen}
        onClose={handleCloseDataImportExport}
      />
    </Container>
  );
};

export default Dashboard;
