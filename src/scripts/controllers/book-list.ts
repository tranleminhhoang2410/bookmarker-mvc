// Constants
import { PAGINATION, ROUTES, SORT, TOAST } from '@/constants';

//Types
import { AddFormHandlers, Book, EditFormHandlers } from '@/types';

import BookModel from '@/models/book';
import BookListView from '@/views/book-list';

//Utils
import { sortArray } from '@/utils/sort-array';

export default class BookListController {
  private bookModel: BookModel;
  private bookListView: BookListView;
  private renderBooks: Book[];
  private currentPage: number;
  private itemsPerPage: number;
  private sortStatus: string;
  private addFormHandlers: AddFormHandlers;
  private editFormHandlers: EditFormHandlers;

  constructor(bookModel: BookModel, bookListView: BookListView) {
    this.bookModel = bookModel;
    this.bookListView = bookListView;
    this.renderBooks = [];
    this.currentPage = 1;
    this.itemsPerPage = PAGINATION.ITEMS_PER_PAGE;
    this.sortStatus = '';

    this.addFormHandlers = {
      getImageUrlHandler: this.handleGetImageUrl,
      getRecommendBookHandler: this.handleGetRecommendBooks,
      addBookHandler: this.handleAddBook,
    };

    this.editFormHandlers = {
      getBookHandler: this.handleGetBookById,
      getRecommendBookHandler: this.handleGetRecommendBooks,
      getImageUrlHandler: this.handleGetImageUrl,
      editBookHandler: this.handleEditBook,
    };
  }

  init = () => {
    this.bookListView.bindDisplayBooks(this.handleDisplayBooks);
    this.bookListView.bindPageChange(this.handlePageChange);
    this.bookListView.bindAddBook(this.addFormHandlers);
    this.bookListView.bindEditBook(this.editFormHandlers);
    this.bookListView.bindSearchInputChange(this.handleSearchBook);
    this.bookListView.bindSortBook(this.handleSortBookByTitle);
    this.bookListView.bindDeleteBook(this.handleDeleteBook);
    this.bookListView.bindNavigationBookDetails(this.handleNavigateBookDetails);
  };

  handleDisplayBooks = async () => {
    try {
      this.bookListView.renderSkeletonBooks(PAGINATION.ITEMS_PER_PAGE);

      const response = await this.bookModel.getBooks();
      const latestBooks = sortArray(response, SORT.KEY.CREATED_AT, SORT.STATUS.DESCENDING);
      this.renderBooks = [...latestBooks];

      this.updateBookList(this.renderBooks);
    } catch (error) {
      this.bookListView.bindRequestError(error as string);
    }
  };

  handleNavigateBookDetails = (bookId: number) => {
    window.location.href = ROUTES.BOOK_DETAILS(bookId);
  };

  updateBookList = (bookList: Book[]) => {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const booksRender = bookList.slice(startIndex, endIndex);

    this.bookListView.renderBooks(bookList, booksRender, this.currentPage);
  };

  handlePageChange = (pageNumber: number) => {
    this.currentPage = pageNumber;
    this.updateBookList(this.renderBooks);
  };

  handleAddBook = async (data: Omit<Book, 'id'>) => {
    try {
      await this.bookModel.addBook(data);
      await this.handleDisplayBooks();
    } catch (error) {
      this.bookListView.bindToastMessage(TOAST.TYPE.FAIL, TOAST.MESSAGE.FAIL, error as string);
    }
  };

  handleGetRecommendBooks = async (query: string) => {
    try {
      const response = await this.bookModel.getRecommendBooks(query);
      return response;
    } catch (error) {
      this.bookListView.bindRequestError(error as string);
      this.bookListView.bindToastMessage(TOAST.TYPE.FAIL, TOAST.MESSAGE.FAIL, error as string);
    }
  };

  handleGetImageUrl = async (fileUpload: FormData) => {
    try {
      const response = await this.bookModel.getImageUrl(fileUpload);
      return response;
    } catch (error) {
      this.bookListView.bindRequestError(error as string);
      this.bookListView.bindToastMessage(TOAST.TYPE.FAIL, TOAST.MESSAGE.FAIL, error as string);
    }
  };

  handleGetBookById = async (bookId: number) => {
    try {
      const response = await this.bookModel.getBookById(bookId);
      return response;
    } catch (error) {
      this.bookListView.bindRequestError(error as string);
      this.bookListView.bindToastMessage(TOAST.TYPE.FAIL, TOAST.MESSAGE.FAIL, error as string);
    }
  };

  handleSearchBook = (keyword: string) => {
    const searchTerm = keyword.trim().toLowerCase();

    const filteredBooks = this.renderBooks.filter((book) => book.name.toLowerCase().includes(searchTerm));

    this.updateBookList(filteredBooks);
  };

  handleSortBookByTitle = (sortStatus: string) => {
    this.sortStatus = sortStatus;

    switch (sortStatus) {
      case SORT.STATUS.ASCENDING: {
        const ascSortedBooks = sortArray(this.renderBooks, SORT.KEY.NAME, SORT.STATUS.ASCENDING);
        this.renderBooks = [...ascSortedBooks];
        break;
      }
      case SORT.STATUS.DESCENDING: {
        const descSortedBooks = sortArray(this.renderBooks, SORT.KEY.NAME, SORT.STATUS.DESCENDING);
        this.renderBooks = [...descSortedBooks];
        break;
      }
      default: {
        this.handleDisplayBooks();
        break;
      }
    }

    this.updateBookList(this.renderBooks);
  };

  handleEditBook = async (bookId: number, bookData: Omit<Book, 'id'>) => {
    try {
      await this.bookModel.editBook(bookId, bookData);
      this.handleDisplayBooks();

      this.bookListView.bindToastMessage(TOAST.TYPE.SUCCESS, TOAST.MESSAGE.SUCCESS, TOAST.DESCRIPTION.EDITED_BOOK);
    } catch (error) {
      this.bookListView.bindRequestError(error as string);
      this.bookListView.bindToastMessage(TOAST.TYPE.FAIL, TOAST.MESSAGE.FAIL, error as string);
    }
  };

  handleDeleteBook = async (bookId: number) => {
    try {
      await this.bookModel.deleteBook(bookId);
      this.renderBooks = await this.bookModel.getBooks();

      // Save the book list when sorting
      if (this.sortStatus !== '') {
        this.handleSortBookByTitle(this.sortStatus);
      }

      // Move back one page if the current page has no items
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      if (startIndex >= this.renderBooks.length && this.currentPage > 1) {
        this.currentPage--;
      }

      //Show the toast message
      this.bookListView.bindToastMessage(TOAST.TYPE.SUCCESS, TOAST.MESSAGE.SUCCESS, TOAST.DESCRIPTION.ADDED_BOOK);

      this.updateBookList(this.renderBooks);
    } catch (error) {
      this.bookListView.bindRequestError(error as string);
      this.bookListView.bindToastMessage(TOAST.TYPE.FAIL, TOAST.MESSAGE.FAIL, error as string);
    }
  };
}
