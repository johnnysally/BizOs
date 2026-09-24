import type { RouteObject } from 'react-router-dom';
import publicRoutes from './publicRoutes';
import roleRoutes from './roleRoutes';

export const AppRoutes: RouteObject[] = [...publicRoutes, ...roleRoutes];