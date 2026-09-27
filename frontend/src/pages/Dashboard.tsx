import React from 'react';
import { Grid, Paper, Typography, Box, IconButton } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { mockPhotos, mockTasks } from '../mocks/data';

export default function Dashboard() {
  const totalPhotos = mockPhotos.length;
  const processedPhotos = mockPhotos.filter(p => p.status === 'processed').length;
  const totalTasks = mockTasks.length;
  const openTasks = mockTasks.filter(t => t.status === 'open').length;

  const stats = [
    {
      title: 'Всего фото',
      value: totalPhotos,
      icon: <PhotoLibraryIcon fontSize="large" />,
      color: '#3b82f6', // blue
      bgColor: '#eff6ff',
    },
    {
      title: 'Обработано',
      value: processedPhotos,
      icon: <CheckCircleIcon fontSize="large" />,
      color: '#10b981', // green
      bgColor: '#ecfdf5',
    },
    {
      title: 'Всего заданий',
      value: totalTasks,
      icon: <AssignmentIcon fontSize="large" />,
      color: '#8b5cf6', // purple
      bgColor: '#f5f3ff',
    },
    {
      title: 'Открытые задания',
      value: openTasks,
      icon: <WarningAmberIcon fontSize="large" />,
      color: '#f59e0b', // amber
      bgColor: '#fffbeb',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Обзор системы
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Сводка активности по анализу дорожной разметки.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box 
                sx={{ 
                  backgroundColor: stat.bgColor, 
                  color: stat.color, 
                  p: 1.5, 
                  borderRadius: 2,
                  display: 'flex'
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography component="h2" variant="body2" color="text.secondary" fontWeight="600">
                  {stat.title}
                </Typography>
                <Typography component="p" variant="h4" fontWeight="700" sx={{ mt: 0.5 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Последняя активность
        </Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Графики и диаграммы будут добавлены в следующих этапах.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
