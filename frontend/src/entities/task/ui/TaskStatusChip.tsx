import React from 'react';
import { Chip } from '@mui/material';
import { TaskStatus } from '../model/types';

interface TaskStatusChipProps {
  status: TaskStatus;
  onClick?: () => void;
  size?: 'small' | 'medium';
}

export const TaskStatusChip: React.FC<TaskStatusChipProps> = ({
  status,
  onClick,
  size = 'small'
}) => {
  const getStatusColor = (
    st: TaskStatus
  ): 'error' | 'warning' | 'success' | 'default' => {
    switch (st) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (st: TaskStatus): string => {
    switch (st) {
      case 'open':
        return 'Открыто';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнено';
      default:
        return st;
    }
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      size={size}
      onClick={onClick}
      sx={{
        fontWeight: 500,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              filter: 'brightness(0.95)'
            }
          : undefined
      }}
    />
  );
};
