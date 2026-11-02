import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Photo, PhotoStatus } from '../photo/model/types';
import { Task, TaskStatus } from '../task/model/types';
import { mockPhotos, mockTasks } from '../../mocks/data';

export interface AddPhotoPayload {
  file?: File | null;
  previewUrl: string;
  address: string;
  simulateStatus?: PhotoStatus;
}

export interface AddTaskPayload {
  photoId: string;
  description: string;
  address?: string;
  status?: TaskStatus;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface DataContextType {
  photos: Photo[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  notification: NotificationState;
  
  // Операции с фото
  addPhoto: (payload: AddPhotoPayload) => Promise<Photo>;
  deletePhoto: (id: string) => void;
  getPhotoById: (id: string) => Photo | undefined;
  
  // Операции с заданиями
  addTask: (payload: AddTaskPayload) => Task;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  getTasksByPhotoId: (photoId: string) => Task[];
  
  // Аналитика
  getStats: () => {
    totalPhotos: number;
    processedPhotos: number;
    totalTasks: number;
    openTasks: number;
  };

  // Уведомления и сброс
  showNotification: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  closeNotification: () => void;
  resetToDefault: () => void;
  simulateLoadingError: () => void;
  clearError: () => void;
}

const STORAGE_KEY_PHOTOS = 'roadmark_ui_photos_v1';
const STORAGE_KEY_TASKS = 'roadmark_ui_tasks_v1';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Инициализация из LocalStorage или исходных mock-данных
  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PHOTOS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Игнор ошибок
    }
    return mockPhotos;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Игнор ошибок
    }
    return mockTasks;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Синхронизация с LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
    } catch {
      // Игнор
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // Игнор
    }
  }, [tasks]);

  const showNotification = useCallback(
    (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      setNotification({
        open: true,
        message,
        severity
      });
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const getPhotoById = useCallback(
    (id: string) => {
      return photos.find(p => p.id === id);
    },
    [photos]
  );

  const getTasksByPhotoId = useCallback(
    (photoId: string) => {
      return tasks.filter(t => t.photoId === photoId);
    },
    [tasks]
  );

  const getStats = useCallback(() => {
    const totalPhotos = photos.length;
    const processedPhotos = photos.filter(p => p.status === 'processed').length;
    const totalTasks = tasks.length;
    const openTasks = tasks.filter(t => t.status === 'open').length;

    return {
      totalPhotos,
      processedPhotos,
      totalTasks,
      openTasks
    };
  }, [photos, tasks]);

  // Добавление новой фотографии с имитацией процесса обработки нейросетью
  const addPhoto = useCallback(
    async (payload: AddPhotoPayload): Promise<Photo> => {
      const newId = `p${Date.now().toString().slice(-4)}`;
      const newPhoto: Photo = {
        id: newId,
        url: payload.previewUrl,
        uploadDate: new Date().toISOString(),
        status: 'processing',
        issuesCount: 0,
        address: payload.address
      };

      setPhotos(prev => [newPhoto, ...prev]);
      showNotification(`Снимок #${newId.toUpperCase()} успешно загружен и отправлен на анализ!`, 'info');

      // Имитация асинхронного ML-анализа дорожного полотна (через 2 секунды)
      setTimeout(() => {
        const detectedIssues = Math.floor(Math.random() * 2) + 1; // 1-2 дефекта
        setPhotos(prev =>
          prev.map(p =>
            p.id === newId
              ? {
                  ...p,
                  status: 'processed',
                  issuesCount: detectedIssues
                }
              : p
          )
        );

        // Автоматическая генерация ремонтного задания для обнаруженного дефекта
        const newTask: Task = {
          id: `t${Date.now().toString().slice(-4)}`,
          photoId: newId,
          description: 'Восстановление стёртой дорожной разметки (дефект обнаружен ИИ)',
          status: 'open',
          createdAt: new Date().toISOString(),
          address: payload.address
        };

        setTasks(prev => [newTask, ...prev]);
        showNotification(
          `Анализ снимка #${newId.toUpperCase()} завершен: обнаружено ${detectedIssues} дефекта(ов). Сформировано задание на ремонт.`,
          'success'
        );
      }, 2500);

      return newPhoto;
    },
    [showNotification]
  );

  const deletePhoto = useCallback(
    (id: string) => {
      setPhotos(prev => prev.filter(p => p.id !== id));
      // Каскадное удаление связанных заданий
      setTasks(prev => prev.filter(t => t.photoId !== id));
      showNotification(`Снимок #${id.toUpperCase()} и связанные с ним задания удалены`, 'info');
    },
    [showNotification]
  );

  const addTask = useCallback(
    (payload: AddTaskPayload): Task => {
      const newId = `t${Date.now().toString().slice(-4)}`;
      const newTask: Task = {
        id: newId,
        photoId: payload.photoId,
        description: payload.description,
        status: payload.status || 'open',
        createdAt: new Date().toISOString(),
        address: payload.address
      };

      setTasks(prev => [newTask, ...prev]);
      showNotification(`Задание #${newId.toUpperCase()} успешно создано`, 'success');
      return newTask;
    },
    [showNotification]
  );

  const updateTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, status } : t))
      );
      const statusNames: Record<TaskStatus, string> = {
        open: '«Открыто»',
        in_progress: '«В работе»',
        completed: '«Выполнено»'
      };
      showNotification(`Статус задания #${id.toUpperCase()} изменён на ${statusNames[status]}`, 'success');
    },
    [showNotification]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      showNotification(`Задание #${id.toUpperCase()} удалено`, 'info');
    },
    [showNotification]
  );

  const resetToDefault = useCallback(() => {
    setPhotos(mockPhotos);
    setTasks(mockTasks);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY_PHOTOS);
      localStorage.removeItem(STORAGE_KEY_TASKS);
    } catch {
      // Игнор
    }
    showNotification('Данные успешно сброшены к начальному состоянию', 'info');
  }, [showNotification]);

  const simulateLoadingError = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setError('Не удалось подключиться к серверу аналитики. Проверьте сетевое соединение.');
    }, 800);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <DataContext.Provider
      value={{
        photos,
        tasks,
        isLoading,
        error,
        notification,
        addPhoto,
        deletePhoto,
        getPhotoById,
        addTask,
        updateTaskStatus,
        deleteTask,
        getTasksByPhotoId,
        getStats,
        showNotification,
        closeNotification,
        resetToDefault,
        simulateLoadingError,
        clearError
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
