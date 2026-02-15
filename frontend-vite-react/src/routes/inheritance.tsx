import { createFileRoute } from '@tanstack/react-router';
import { Inheritance } from '@/pages/inheritance';

export const Route = createFileRoute('/inheritance')({
  component: Inheritance,
});
