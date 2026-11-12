import type { RouteRecord } from 'vite-react-ssg'
import Layout from './Layout'
import HomePage from './pages/HomePage'
import BookPage from './pages/BookPage'
import BookConfirmedPage from './pages/BookConfirmedPage'
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
      { path: 'book/confirmed', element: <BookConfirmedPage /> },
      { path: 'info', element: <InfoPage /> },
      { path: 'explore', element: <ExplorePage /> },
    ],
  },
]
