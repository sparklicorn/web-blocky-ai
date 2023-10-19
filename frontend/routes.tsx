import { lazy } from 'react';
import { createBrowserRouter, IndexRouteObject, NonIndexRouteObject, useMatches } from 'react-router-dom';
import BlockyAiView from './views/blocky-ai/BlockyAiView';
import EngineView from './views/engine/EngineView';
import Main from './views/Main';
import CircleIntersectionToolView from './views/engine/CircleIntersectionToolView';

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
      { index: true, element: <Main /> },
      { path: '/about', element: <AboutView /> },
      { path: '/projects', element: <AboutView /> },
      { path: '/posts', element: <AboutView /> },
      { path: '/demos', element: <AboutView /> },
      { path: '/demos/blocky', element: <BlockyAiView /> },
      { path: '/demos/engine', element: <EngineView /> },
      { path: '/demos/circle-intersection', element: <CircleIntersectionToolView /> },
      { path: '*', element: <Main /> },
    ],
  },
];

const router = createBrowserRouter([...routes]);
export default router;
