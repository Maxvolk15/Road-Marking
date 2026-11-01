import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Grow,
  Divider
} from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../entities/model/DataContext';
import { PageHeader } from '../../shared/ui/PageHeader';
import { formatDateTime } from '../../shared/lib/date';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { getStats, photos, tasks, resetToDefault } = useData();
  const stats = getStats();

  const statCards = [
    {
      title: 'Всего фото',
      value: stats.totalPhotos,
      icon: <PhotoLibraryIcon fontSize="large" />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      onClick: () => navigate('/analysis')
    },
    {
      title: 'Обработано',
      value: stats.processedPhotos,
      icon: <CheckCircleIcon fontSize="large" />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      onClick: () => navigate('/analysis')
    },
    {
      title: 'Всего заданий',
      value: stats.totalTasks,
      icon: <AssignmentIcon fontSize="large" />,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      onClick: () => navigate('/tasks')
    },
    {
      title: 'Открытые задания',
      value: stats.openTasks,
      icon: <WarningAmberIcon fontSize="large" />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      onClick: () => navigate('/tasks')
    }
  ];

  const recentPhotos = photos.slice(0, 3);
  const recentTasks = tasks.slice(0, 4);

  return (
    <Box>
      <PageHeader
        title="Обзор системы"
        subtitle="Сводка активности по анализу дорожной разметки в реальном времени."
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={resetToDefault}
              color="inherit"
              title="Сбросить тестовые данные"
            >
              Сброс демо
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate('/upload')}
            >
              Загрузить снимок
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Grow in timeout={(index + 1) * 200}>
              <Paper
                elevation={0}
                onClick={stat.onClick}
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08)',
                    borderColor: 'primary.light'
                  }
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
            </Grow>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom fontWeight={700}>
          Последняя активность
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: 2.5,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Недавние снимки разметки
                </Typography>
                <Button size="small" onClick={() => navigate('/analysis')}>
                  Все фото →
                </Button>
              </Box>

              <List disablePadding>
                {recentPhotos.map((photo, idx) => (
                  <React.Fragment key={photo.id}>
                    <ListItem
                      alignItems="center"
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => navigate(`/analysis/${photo.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={photo.url}
                          alt={photo.id}
                          sx={{ width: 48, height: 48, mr: 1, bgcolor: 'action.hover' }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            Снимок #{photo.id.toUpperCase()}{' '}
                            {photo.address && `• ${photo.address}`}
                          </Typography>
                        }
                        secondary={`Загружен: ${formatDateTime(photo.uploadDate)}`}
                      />
                      <Box>
                        {photo.status === 'processed' && (
                          <Chip
                            label={`${photo.issuesCount} деф.`}
                            size="small"
                            color={photo.issuesCount > 0 ? 'error' : 'success'}
                          />
                        )}
                        {photo.status === 'processing' && (
                          <Chip label="В анализе" size="small" color="warning" />
                        )}
                        {photo.status === 'error' && (
                          <Chip label="Ошибка" size="small" color="error" />
                        )}
                      </Box>
                    </ListItem>
                    {idx < recentPhotos.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: 2.5,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Активные ремонтные задания
                </Typography>
                <Button size="small" onClick={() => navigate('/tasks')}>
                  Все задания →
                </Button>
              </Box>

              <List disablePadding>
                {recentTasks.map((task, idx) => (
                  <React.Fragment key={task.id}>
                    <ListItem
                      alignItems="center"
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => navigate(`/analysis/${task.photoId}`)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor:
                              task.status === 'completed'
                                ? '#ecfdf5'
                                : task.status === 'in_progress'
                                ? '#fff3cd'
                                : '#ffebee',
                            color:
                              task.status === 'completed'
                                ? 'success.main'
                                : task.status === 'in_progress'
                                ? 'warning.main'
                                : 'error.main'
                          }}
                        >
                          {task.status === 'completed' ? (
                            <AssignmentTurnedInIcon fontSize="small" />
                          ) : task.status === 'in_progress' ? (
                            <AssignmentIcon fontSize="small" />
                          ) : (
                            <AssignmentLateIcon fontSize="small" />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 260 }}>
                            {task.description}
                          </Typography>
                        }
                        secondary={task.address || `Снимок #${task.photoId.toUpperCase()}`}
                      />
                      <Box>
                        <Chip
                          label={
                            task.status === 'completed'
                              ? 'Выполнено'
                              : task.status === 'in_progress'
                              ? 'В работе'
                              : 'Открыто'
                          }
                          size="small"
                          color={
                            task.status === 'completed'
                              ? 'success'
                              : task.status === 'in_progress'
                              ? 'warning'
                              : 'error'
                          }
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                    {idx < recentTasks.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
