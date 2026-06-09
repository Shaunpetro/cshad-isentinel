// src/services/news/index.ts
export * from './types';
export { fetchNews, fetchNewsById, fetchBreakingNews, subscribeToNews } from './newsService';
export { mapRecordsToNewsItems, mapRecordToNewsItem } from './newsMapper';
export type { TimeFilter } from './newsService';
export { REFRESH_INTERVALS } from './newsService';