import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../shared/config/theme';
import { DataProvider } from '../entities/model/DataContext';
import { AppRouter } from './router';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
