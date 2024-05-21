import { Book, RecommendBook } from './book';

export type PageChangeHandler = (pageNumber: number) => void;

export type AddBookHandler = (data: Omit<Book, 'id'>) => void;

export type GetImageUrlHandler = (formData: FormData) => Promise<string>;

export type DisplayFormHandler = (bookId: number) => Promise<Book>;

export type EditBookHandler = (bookId: number, data: Omit<Book, 'id'>) => void;

export type GetRecomendBookHandler = (query: string) => Promise<RecommendBook[]>;
