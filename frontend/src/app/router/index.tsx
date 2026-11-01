import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../../shared/ui/Layout';
import {
  DashboardPage,
  UploadPage,
  AnalysisPage,
  AnalysisDetailPage,
  TasksPage
} from '../../pages';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="analysis/:id" element={<AnalysisDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
