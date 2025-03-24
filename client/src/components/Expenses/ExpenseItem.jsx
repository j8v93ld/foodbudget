import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Delete,
  Edit,
  Restaurant,
  ShoppingBag,
  Store
} from '@mui/icons-material';
import { formatDate } from '../../utils/dateUtils';
import { BudgetContext } from '../../context/BudgetContext';

// Mapowanie kategorii na ikony
const categoryIcons = {
  'Restauracja': <Restaurant />,
  'default': <ShoppingBag />
};

const ExpenseItem = ({ expense }) => {
  const { removeExpense } = useContext(BudgetContext);
  
  // Określenie ikony kategorii
  const getCategoryIcon = (category) => {
    return categoryIcons[category] || categoryIcons.default;
  };
  
  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={getCategoryIcon(expense.category)}
              label={expense.category || 'Inne'}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            
            <Typography variant="h6" component="span">
              {expense.amount.toFixed(2)} zł
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title="Usuń wydatek">
              <IconButton 
                size="small"
                color="error"
                onClick={() => removeExpense(expense.id)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {expense.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {expense.shop && (
              <>
                <Store fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {expense.shop}
                </Typography>
              </>
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {formatDate(expense.date)}
          </Typography>
        </Box>
        
        {expense.duration && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
            Wystarczy na: {expense.duration} dni
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseItem;
