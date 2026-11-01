import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  retryLabel?: string;
  backLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Произошла ошибка',
  message,
  onRetry,
  onBack,
  retryLabel = 'Повторить попытку',
  backLabel = 'Назад'
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'error.light',
        borderRadius: 3,
        bgcolor: '#fef2f2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        my: 2
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />
      <Typography variant="h6" color="error.dark">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
        {onRetry && (
          <Button variant="contained" color="error" size="small" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {onBack && (
          <Button variant="outlined" size="small" onClick={onBack}>
            {backLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
};
