import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { CampaignsPage } from '../pages/CampaignsPage'
import { CharacterCreatorPage } from '../pages/CharacterCreatorPage'
import { CharactersPage } from '../pages/CharactersPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'characters', element: <CharactersPage /> },
      { path: 'creator', element: <CharacterCreatorPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
