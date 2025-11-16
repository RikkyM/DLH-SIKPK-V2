export interface Pagination<T> {
  success: boolean;
  current_page: number;
  data: T[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  links: [];
}
