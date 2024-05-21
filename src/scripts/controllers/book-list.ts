// Constants
import { PAGINATION } from '@/constants';

//Types
import { Book, RecommendBook } from '@/types';

import BookModel from '@/models/book';
import BookListView from '@/views/book-list';

export default class BookListController {
  private bookModel: BookModel;
  private bookListView: BookListView;
  private originalBooks: Book[];
  private renderBooks: Book[];
  private currentPage: number;
  private itemsPerPage: number;
  private recommendBooks: RecommendBook[];

  constructor(bookModel: BookModel, bookListView: BookListView) {
    this.bookModel = bookModel;
    this.bookListView = bookListView;
    this.originalBooks = [];
    this.renderBooks = [];
    this.currentPage = 1;
    this.itemsPerPage = PAGINATION.ITEMS_PER_PAGE;
    this.recommendBooks = [];
  }

  init = async () => {
    await this.displayBookList();
    this.bookListView.bindPageChange(this.handlePageChange);
    this.bookListView.bindAddBook(this.handleGetImageUrl, this.handleAddBook, this.handleGetRecommendBooks);
    this.bookListView.bindEditBook(
      this.handleGetBookById,
      this.handleGetImageUrl,
      this.handleGetRecommendBooks,
      this.handleEditBook,
    );
  };

  displayBookList = async () => {
    this.bookListView.displaySkeletonBooks(PAGINATION.ITEMS_PER_PAGE);
    const response = await this.bookModel.getBooks();
    this.originalBooks = response;
    this.renderBooks = [...this.originalBooks];
    this.updateBookList(this.renderBooks);
  };

  updateBookList = (bookList: Book[]) => {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const booksToShow = bookList.slice(startIndex, endIndex);
    this.bookListView.displayBooks(bookList, booksToShow, this.currentPage);
  };

  handlePageChange = (pageNumber: number) => {
    this.currentPage = pageNumber;
    this.updateBookList(this.renderBooks);
  };

  handleAddBook = async (data: Omit<Book, 'id'>) => {
    const response = await this.bookModel.addBook(data);
    this.renderBooks.unshift(response);
    this.originalBooks = [...this.renderBooks];
    this.updateBookList(this.originalBooks);
  };

  handleGetRecommendBooks = async (query: string) => {
    const response = await this.bookModel.getRecommendBooks(query);
    return response;
  };

  handleGetImageUrl = async (fileUpload: FormData) => {
    const response = await this.bookModel.getImageUrl(fileUpload);
    return response ?? '';
  };

  handleGetBookById = async (bookId: number) => {
    const response = await this.bookModel.getBookById(bookId);
    return response;
  };

  handleEditBook = async (bookId: number, bookData: Omit<Book, 'id'>) => {
    await this.bookModel.editBook(bookId, bookData);
    this.displayBookList();
  };
}
