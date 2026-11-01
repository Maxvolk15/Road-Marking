import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Photo } from '../model/types';
import { PhotoStatusChip } from './PhotoStatusChip';
import { formatDateTime } from '../../../shared/lib/date';

interface PhotoCardProps {
  photo: Photo;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: photo.status === 'error' ? 'error.light' : 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={photo.url}
          alt={`Фото ${photo.id}`}
          sx={{
            opacity: photo.status === 'error' ? 0.75 : 1,
            backgroundColor: '#f1f5f9',
            objectFit: 'cover'
          }}
        />
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
          <PhotoStatusChip status={photo.status} />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="div">
          Снимок #{photo.id.toUpperCase()}
        </Typography>

        {photo.address && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap>
              {photo.address}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Загружено: {formatDateTime(photo.uploadDate)}
        </Typography>

        <Box sx={{ mt: 'auto', pt: 1 }}>
          {photo.status === 'processed' && (
            <Chip
              label={`Обнаружено проблем: ${photo.issuesCount}`}
              color={photo.issuesCount > 0 ? 'error' : 'default'}
              variant={photo.issuesCount > 0 ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          )}
          {photo.status === 'processing' && (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              Нейросеть анализирует снимок...
            </Typography>
          )}
          {photo.status === 'error' && (
            <Typography variant="body2" color="error" fontWeight={500}>
              {photo.errorMessage || 'Ошибка сегментации разметки: низкое качество кадра.'}
            </Typography>
          )}
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ p: 2, pt: 1.5 }}>
        <Button
          size="small"
          component={RouterLink}
          to={`/analysis/${photo.id}`}
          endIcon={<ArrowForwardIcon />}
          sx={{ ml: 'auto' }}
          disabled={photo.status === 'processing'}
        >
          Детали
        </Button>
      </CardActions>
    </Card>
  );
};
