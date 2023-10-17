import MainLayout from 'Frontend/views/MainLayout.js';
import { lazy } from 'react';
import { createBrowserRouter, IndexRouteObject, NonIndexRouteObject, useMatches } from 'react-router-dom';
import BlockyAiView from './views/blocky-ai/BlockyAiView';
import EngineView from './views/engine/EngineView';

const AboutView = lazy(async () => import('Frontend/views/about/AboutView.js'));
export type MenuProps = Readonly<{
  icon?: string;
  title?: string;
}>;

export type ViewMeta = Readonly<{ handle?: MenuProps }>;

type Override<T, E> = Omit<T, keyof E> & E;

export type IndexViewRouteObject = Override<IndexRouteObject, ViewMeta>;
export type NonIndexViewRouteObject = Override<
  Override<NonIndexRouteObject, ViewMeta>,
  {
    children?: ViewRouteObject[];
  }
>;
export type ViewRouteObject = IndexViewRouteObject | NonIndexViewRouteObject;

type RouteMatch = ReturnType<typeof useMatches> extends (infer T)[] ? T : never;

export type ViewRouteMatch = Readonly<Override<RouteMatch, ViewMeta>>;

export const useViewMatches = useMatches as () => readonly ViewRouteMatch[];

export const routes: readonly ViewRouteObject[] = [
  {
    path: '/',
    children: [
      { index: true, element: <MainLayout /> },
      { path: '/about', element: <AboutView /> },
      { path: '/projects', element: <AboutView /> },
      { path: '/posts', element: <AboutView /> },
      { path: '/demos', element: <AboutView /> },
      { path: '/demos/blocky', element: <BlockyAiView /> },
      { path: '/demos/engine', element: <EngineView /> },
      { path: '*', element: <MainLayout /> },
    ],
  },
];

const router = createBrowserRouter([...routes]);
export default router;
