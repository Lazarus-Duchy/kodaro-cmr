import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles.css';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider } from './Context/AuthContext';
import App from './App';
import { theme } from './theme';

// Your deployment URL is printed after running `npx convex dev`
// Store it in a .env file at the project root:
//   VITE_CONVEX_URL=https://happy-animal-123.convex.cloud
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <MantineProvider theme={theme}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MantineProvider>
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>
);