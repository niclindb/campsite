import type { RouteRecord } from 'vite-react-ssg'
import Layout from './Layout'
import HomePage from './pages/HomePage'
import BookPage from './pages/BookPage'
import InfoPage from './pages/InfoPage'
import ExplorePage from './pages/ExplorePage'

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    entry: 'src/Layout.tsx',
    children: [
      { index: true, element: <HomePage /> },
      { path: 'book', element: <BookPage /> },
      { path: 'info', element: <InfoPage /> },
      { path: 'explore', element: <ExplorePage /> },
    ],
  },
]
