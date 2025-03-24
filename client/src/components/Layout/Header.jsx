import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { RestaurantMenu, AttachMoney, Receipt, Home, Add } from '@mui/icons-material';
import { BudgetContext } from '../../context/BudgetContext';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { budget } = useContext(BudgetContext);

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Container>
        <Toolbar>
          <RestaurantMenu sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            FoodBudget
          </Typography>

          {/* Wyświetlanie dostępnej kwoty */}
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <AttachMoney />
            <Typography variant="body1" component="span">
              {budget.currentAmount.toFixed(2)} zł
            </Typography>
          </Box>

          {/* Przyciski nawigacyjne */}
          <Box sx={{ display: 'flex' }}>
            {!isMobile && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
                startIcon={<Home />}
              >
                Dashboard
              </Button>
            )}
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/add-expense"
              startIcon={<Add />}
            >
              {isMobile ? '' : 'Dodaj wydatek'}
            </Button>
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/scan-receipt"
              startIcon={<Receipt />}
            >
              {isMobile ? '' : 'Skanuj paragon'}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
