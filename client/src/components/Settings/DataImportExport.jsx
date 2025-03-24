import React, { useState, useContext, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  FileDownload,
  FileUpload,
  CloudDownload,
  Warning
} from '@mui/icons-material';
import { BudgetContext } from '../../context/BudgetContext';
import { exportData, importData } from '../../services/localStorageService';

const DataImportExport = ({ open, onClose }) => {
  const { budget, expenses, updateBudget, setExpenses } = useContext(BudgetContext);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Funkcja eksportu danych
  const handleExport = () => {
    try {
      // Przygotowanie danych do eksportu
      const data = {
        budget,
        expenses,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      // Tworzenie i pobieranie pliku JSON
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Tworzenie tymczasowego linku do pobrania pliku
      const a = document.createElement('a');
      a.href = url;
      a.download = `foodbudget-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Czyszczenie
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Błąd podczas eksportu danych:', error);
    }
  };

  // Funkcja obsługująca wybór pliku do importu
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  // Funkcja obsługująca import danych
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportError('');
    setImportSuccess(false);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Walidacja danych
          if (!data.budget || !data.expenses) {
            throw new Error('Nieprawidłowy format pliku. Brak wymaganych danych.');
          }
          
          // Aktualizacja danych w aplikacji
          updateBudget(data.budget);
          setExpenses(data.expenses);
          
          setImportSuccess(true);
        } catch (parseError) {
          console.error('Błąd parsowania pliku JSON:', parseError);
          setImportError('Nieprawidłowy format pliku. Upewnij się, że importujesz prawidłowy plik JSON z kopią zapasową FoodBudget.');
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.onerror = () => {
        setImportError('Wystąpił błąd podczas odczytu pliku.');
        setIsImporting(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Błąd podczas importu danych:', error);
      setImportError('Wystąpił nieoczekiwany błąd podczas importu danych.');
      setIsImporting(false);
    }
    
    // Czyszczenie input file, aby można było zaimportować ten sam plik ponownie
    event.target.value = null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Import/Eksport danych</DialogTitle>
      
      <DialogContent>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Eksport danych
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Eksportuj wszystkie dane (budżet, wydatki) do pliku JSON. Możesz użyć tego pliku jako kopii zapasowej lub do przeniesienia danych na inne urządzenie.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownload />}
            onClick={handleExport}
          >
            Eksportuj dane
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Import danych
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Zaimportuj dane z pliku JSON. Ta operacja zastąpi wszystkie obecne dane w aplikacji.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Uwaga: Import danych zastąpi wszystkie Twoje obecne dane. Zalecamy wcześniejsze wykonanie kopii zapasowej.
            </Typography>
          </Alert>
          
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}
          
          {importSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Dane zostały pomyślnie zaimportowane.
            </Alert>
          )}
          
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={isImporting ? <CircularProgress size={20} /> : <FileUpload />}
            onClick={handleFileSelect}
            disabled={isImporting}
          >
            {isImporting ? 'Importowanie...' : 'Wybierz plik do importu'}
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataImportExport;
