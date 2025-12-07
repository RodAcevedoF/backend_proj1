export interface SearchExternalArticlesDTO {
  query: string;
  limit?: number; // Default: 10
  offset?: number; // Default: 0
}
