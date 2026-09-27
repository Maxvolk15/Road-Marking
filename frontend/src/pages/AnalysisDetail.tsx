import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Paper, Divider, List, 
  ListItem, ListItemText, Grid, Chip, Avatar, ListItemAvatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { mockPhotos, mockTasks } from '../mocks/data';

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const photo = mockPhotos.find(p => p.id === id);
  const tasks = mockTasks.filter(t => t.photoId === id);

  if (!photo) {
    return (
      <Box textAlign="center" py={10}>
        <Typography variant="h5" color="text.secondary">Фото не найдено</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/analysis')} sx={{ mt: 2 }}>
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/analysis')}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Назад к списку
      </Button>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">
          Детали анализа: #{photo.id.toUpperCase()}
        </Typography>
        
        {photo.status === 'processed' && (
          <Chip 
            label={`Проблем: ${photo.issuesCount}`} 
            color={photo.issuesCount > 0 ? 'error' : 'success'} 
            sx={{ fontWeight: 600 }}
          />
        )}
        {photo.status === 'error' && (
          <Chip 
            label="Ошибка обработки" 
            color="error"
            icon={<ErrorOutlineIcon />}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {photo.status === 'error' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'error.50', color: 'error.dark', border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <ErrorOutlineIcon fontSize="large" color="error" />
            <Box>
              <Typography variant="h6">Внимание! Произошла ошибка при анализе изображения</Typography>
              <Typography variant="body2">
                Нейросеть не смогла распознать дорожную разметку. Возможные причины: снимок слишком тёмный, размыт или на нём отсутствует дорога.
                Пожалуйста, загрузите более чёткую фотографию этого участка.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: photo.status === 'error' ? 'error.light' : 'divider', borderRadius: 3 }}>
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                component="img"
                src={photo.url}
                alt={`Photo ${photo.id}`}
                sx={{ 
                  width: '100%', 
                  display: 'block', 
                  backgroundColor: '#f1f5f9'
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentLateIcon color="action" /> Связанные задания
          </Typography>
          
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            {photo.status === 'error' ? (
              <Box p={4} textAlign="center">
                <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.5, mb: 1 }} />
                <Typography color="text.secondary">Задания не могут быть сформированы.</Typography>
                <Typography variant="body2" color="text.secondary">Требуется повторный анализ.</Typography>
              </Box>
            ) : tasks.length > 0 ? (
              <List disablePadding>
                {tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem alignItems="flex-start" sx={{ p: 2, bgcolor: task.status === 'completed' ? 'action.hover' : 'transparent' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: task.status === 'completed' ? 'success.light' : 'warning.light' }}>
                          {task.status === 'completed' ? <CheckCircleOutlineIcon /> : <AssignmentLateIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="subtitle2" fontWeight="600">{task.description}</Typography>} 
                        secondary={
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip 
                              size="small"
                              label={task.status === 'completed' ? 'Выполнено' : task.status === 'in_progress' ? 'В работе' : 'Открыто'} 
                              color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'error'}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                            </Typography>
                          </Box>
                        } 
                      />
                    </ListItem>
                    {index < tasks.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box p={4} textAlign="center">
                <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.5, mb: 1 }} />
                <Typography color="text.secondary">Проблем не обнаружено.</Typography>
                <Typography variant="body2" color="text.secondary">Задания на ремонт не требуются.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
