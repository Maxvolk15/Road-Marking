import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PhotoStatus } from '../model/types';

interface PhotoStatusChipProps {
  status: PhotoStatus;
  size?: 'small' | 'medium';
}

export const PhotoStatusChip: React.FC<PhotoStatusChipProps> = ({ status, size = 'small' }) => {
  switch (status) {
    case 'processed':
      return (
        <Chip
          icon={<CheckCircleOutlineIcon />}
          label="Обработано"
          color="success"
          size={size}
          sx={{ fontWeight: 600, boxShadow: 1 }}
        />
      );
    case 'processing':
      return (
        <Chip
          icon={<HourglassEmptyIcon />}
          label="В обработке"
          color="warning"
          size={size}
          sx={{ fontWeight: 600, boxShadow: 1 }}
        />
      );
    case 'error':
      return (
        <Chip
          icon={<ErrorOutlineIcon />}
          label="Ошибка"
          color="error"
          size={size}
          sx={{ fontWeight: 600, boxShadow: 1 }}
        />
      );
    default:
      return <Chip label={status} size={size} />;
  }
};
