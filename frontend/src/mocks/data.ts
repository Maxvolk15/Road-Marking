export interface Photo {
  id: string;
  url: string;
  uploadDate: string;
  status: 'processed' | 'processing' | 'error';
  issuesCount: number;
  address?: string;
}

export interface Task {
  id: string;
  photoId: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  address?: string;
}

export const mockPhotos: Photo[] = [
  {
    id: 'p1',
    url: 'https://images.oxu.az/2024/08/05/1xIZX9xHfESJRfnj64aCMy8S9YV47DhGnpUD1SDa:1200.jpg',
    uploadDate: '2023-10-25T10:00:00Z',
    status: 'processed',
    issuesCount: 1,
    address: 'ул. Ленина, 15'
  },
  {
    id: 'p2',
    url: 'https://cdn.iportal.ru/news/2017/preview/6d37d6b6dc378807820fe1d6c17a321208b7ee3c_1280.jpg',
    uploadDate: '2023-10-26T11:30:00Z',
    status: 'processing',
    issuesCount: 0,
    address: 'пр-т Мира, 42'
  },
  {
    id: 'p3',
    url: 'https://avatars.dzeninfra.ru/get-zen_doc/1592433/pub_62c27ee00925c9323520d332_62c2846e4b3d3f57880533e0/scale_1200',
    uploadDate: '2023-10-27T09:15:00Z',
    status: 'processed',
    issuesCount: 2,
    address: 'ул. Пушкина, 10'
  },
  {
    id: 'p4',
    url: 'https://gorodkirov.ru/media/django-summernote/2023-06-20/83d7f024-ee88-4152-8c22-980bf404cac3.webp',
    uploadDate: '2023-10-28T11:15:00Z',
    status: 'error',
    issuesCount: 0,
    address: 'ул. Пушкина, 10'
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    photoId: 'p1',
    description: 'Обновить разметку пешеходного перехода',
    status: 'in_progress',
    createdAt: '2023-10-25T10:30:00Z',
    address: 'ул. Ленина, 15'
  },
  {
    id: 't2',
    photoId: 'p3',
    description: 'Окраска стоп-линии',
    status: 'completed',
    createdAt: '2023-10-27T09:45:00Z',
    address: 'ул. Пушкина, 10'
  }
];
