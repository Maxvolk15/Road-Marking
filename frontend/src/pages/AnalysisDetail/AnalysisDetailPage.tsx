import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Chip,
  Avatar,
  ListItemAvatar,
  IconButton,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { useData } from '../../entities/model/DataContext';
import { TaskStatus } from '../../entities/task/model/types';
import { TaskStatusChip } from '../../entities/task';
import { CreateTaskDialog } from '../../features/create-task';
import { ErrorState } from '../../shared/ui/ErrorState';
import { formatDateTime } from '../../shared/lib/date';

export const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPhotoById, getTasksByPhotoId, updateTaskStatus, deleteTask } = useData();

  const [createTaskOpen, setCreateTaskOpen] = useState<boolean>(false);

  const photo = id ? getPhotoById(id) : undefined;
  const tasks = id ? getTasksByPhotoId(id) : [];

  if (!photo) {
    return (
      <Box sx={{ py: 6 }}>
        <ErrorState
          title="Фотография не найдена"
          message={`Снимок с идентификатором #${id || ''} отсутствует в системе или был удалён.`}
          onBack={() => navigate('/analysis')}
          backLabel="Вернуться к списку анализа"
        />
      </Box>
    );
  }

  // Быстрое циклическое переключение статуса задачи
  const handleCycleStatus = (taskId: string, currentStatus: TaskStatus) => {
    const cycle: Record<TaskStatus, TaskStatus> = {
      open: 'in_progress',
      in_progress: 'completed',
      completed: 'open'
    };
    updateTaskStatus(taskId, cycle[currentStatus]);
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/analysis')}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Назад к списку
      </Button>

      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Детали анализа: #{photo.id.toUpperCase()}
          </Typography>
          {photo.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {photo.address}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
          {photo.status === 'processing' && (
            <Chip label="В обработке" color="warning" sx={{ fontWeight: 600 }} />
          )}
        </Box>
      </Box>

      {photo.status === 'error' && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#fef2f2',
            color: 'error.dark',
            border: '1px solid',
            borderColor: 'error.light',
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <ErrorOutlineIcon fontSize="large" color="error" />
            <Box>
              <Typography variant="h6">Внимание! Произошла ошибка при анализе изображения</Typography>
              <Typography variant="body2">
                Нейросеть не смогла распознать дорожную разметку. Возможные причины: снимок слишком тёмный,
                размыт или на нём отсутствует дорога. Пожалуйста, загрузите более чёткую фотографию этого участка.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: photo.status === 'error' ? 'error.light' : 'divider',
              borderRadius: 3
            }}
          >
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <Box
                component="img"
                src={photo.url}
                alt={`Photo ${photo.id}`}
                sx={{
                  width: '100%',
                  maxHeight: 450,
                  display: 'block',
                  backgroundColor: '#f1f5f9',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonthIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Дата съемки: {formatDateTime(photo.uploadDate)}
                </Typography>
              </Box>
              {photo.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {photo.address}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon color="action" /> Связанные задания ({tasks.length})
            </Typography>
            {photo.status !== 'error' && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCreateTaskOpen(true)}
              >
                Добавить
              </Button>
            )}
          </Box>

          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
          >
            {photo.status === 'error' ? (
              <Box p={4} textAlign="center">
                <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.5, mb: 1 }} />
                <Typography color="text.secondary">Задания не могут быть сформированы.</Typography>
                <Typography variant="body2" color="text.secondary">
                  Требуется повторный анализ.
                </Typography>
              </Box>
            ) : tasks.length > 0 ? (
              <List disablePadding>
                {tasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        p: 2,
                        bgcolor: task.status === 'completed' ? 'action.hover' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                      secondaryAction={
                        <Tooltip title="Удалить задание">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => deleteTask(task.id)}
                            color="default"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              task.status === 'completed'
                                ? 'success.light'
                                : task.status === 'in_progress'
                                ? 'warning.light'
                                : 'error.light'
                          }}
                        >
                          {task.status === 'completed' ? (
                            <AssignmentTurnedInIcon />
                          ) : task.status === 'in_progress' ? (
                            <AssignmentIcon />
                          ) : (
                            <AssignmentLateIcon />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="600" sx={{ pr: 2 }}>
                            {task.description}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Нажмите, чтобы изменить статус">
                              <span>
                                <TaskStatusChip
                                  status={task.status}
                                  onClick={() => handleCycleStatus(task.id, task.status)}
                                />
                              </span>
                            </Tooltip>
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
                <AssignmentTurnedInIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.5, mb: 1 }} />
                <Typography color="text.secondary">Проблем не обнаружено.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Задания на ремонт не требуются.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateTaskOpen(true)}
                >
                  Создать задание вручную
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <CreateTaskDialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        defaultPhotoId={photo.id}
        defaultAddress={photo.address}
      />
    </Box>
  );
};
