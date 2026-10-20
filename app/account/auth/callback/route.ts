import { customerRoute, customers } from '@/lib/customers';

export const GET = customerRoute(customers.callback);
