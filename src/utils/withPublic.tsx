import { ComponentType } from 'react';
import { PublicRoute } from '../components/layouts/publicRoute';

export function withPublic<T extends object>(Component: ComponentType<T>) {
  return function PublicComponent(props: T) {
    return (
      <PublicRoute>
        <Component {...props} />
      </PublicRoute>
    );
  };
}