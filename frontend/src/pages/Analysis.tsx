import React from 'react';
import { 
  Box, Typography, Card, CardMedia, CardContent, 
  CardActions, Button, Grid, Chip, Divider 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { mockPhotos } from '../mocks/data';

export default function Analysis() {
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'processed':
        return <Chip label="Обработано" color="success" size="small" sx={{ fontWeight: 600, boxShadow: 1 }} />;
      case 'processing':
        return <Chip label="В обработке" color="warning" size="small" sx={{ fontWeight: 600, boxShadow: 1 }} />;
      case 'error':
        return <Chip label="Ошибка" color="error" size="small" sx={{ fontWeight: 600, boxShadow: 1 }} />;
      default:
        return <Chip label="Абсолют ошибка" size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Результаты анализа
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Список обработанных изображений и обнаруженных дефектов разметки.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {mockPhotos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: photo.status === 'error' ? 'error.light' : 'divider', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={photo.url}
                  alt={`Photo ${photo.id}`}
                  sx={{ opacity: photo.status === 'error' ? 0.7 : 1 }}
                />
                <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                  {getStatusChip(photo.status)}
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  Снимок #{photo.id.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Загружено: {new Date(photo.uploadDate).toLocaleString('ru-RU')}
                </Typography>
                
                {photo.status === 'processed' && (
                  <Chip 
                    label={`Обнаружено проблем: ${photo.issuesCount}`} 
                    color={photo.issuesCount > 0 ? 'error' : 'default'} 
                    variant={photo.issuesCount > 0 ? "filled" : "outlined"}
                    size="small" 
                  />
                )}
                {photo.status === 'processing' && (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Нейросеть анализирует снимок...
                  </Typography>
                )}
                {photo.status === 'error' && (
                  <Typography variant="body2" color="error" fontWeight={500}>
                    Не удалось обработать фотографию (низкое качество или сбой ML).
                  </Typography>
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ p: 2 }}>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
