export type PhotoStatus = 'processed' | 'processing' | 'error';

export interface Photo {
  id: string;
  url: string;
  uploadDate: string;
  status: PhotoStatus;
  issuesCount: number;
  address?: string;
  errorMessage?: string;
}
