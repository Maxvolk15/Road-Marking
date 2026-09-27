import React, { useState } from 'react';
import { Box, Button, Typography, Paper, IconButton, TextField } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleUpload = () => {
    alert(`Имитация загрузки файла: ${selectedFile?.name}\nАдрес: ${address || 'Не указан'}`);
    handleRemove();
    setAddress('');
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Загрузка фотографий
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Загрузите изображения улиц и укажите адрес для автоматического анализа дефектов разметки.
        </Typography>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: 5, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          border: '2px dashed',
          borderColor: selectedFile ? 'primary.main' : 'divider',
          backgroundColor: selectedFile ? 'primary.50' : 'background.default',
          transition: 'all 0.2s ease',
          minHeight: 300
        }}
      >
        {!selectedFile ? (
          <>
            <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: 'primary.50', color: 'primary.main', mb: 2 }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h6">
              Перетащите файл сюда или нажмите для выбора
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Поддерживаются форматы: JPG, PNG (макс. 10 МБ)
            </Typography>
            
            <Button
              component="label"
              variant="contained"
              size="large"
            >
              Выбрать изображение
              <input
                type="file"
                hidden
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
              />
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 500 }}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              {preview && (
                <Box 
                  component="img" 
                  src={preview} 
                  alt="Preview" 
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: 300, 
                    borderRadius: 2,
                    boxShadow: 2
                  }} 
                />
              )}
              <IconButton 
                size="small" 
                onClick={handleRemove}
                sx={{ 
                  position: 'absolute', 
                  top: -12, 
                  right: -12, 
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { backgroundColor: 'error.50', color: 'error.main' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
            
            <TextField 
              fullWidth
              label="Адрес, где сделано фото" 
              variant="outlined" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ mb: 3, backgroundColor: 'background.paper' }}
              placeholder="Например: ул. Ленина, 15"
            />
            
            <Button
              variant="contained"
              size="large"
              onClick={handleUpload}
              sx={{ minWidth: 200 }}
              disabled={!address.trim()}
            >
              Начать анализ
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
