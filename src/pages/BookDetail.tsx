import React from "react"

import { useParams } from 'react-router-dom'
import BookService from "../features/books/services/books"
import BookLogService from "../features/books/services/bookLogs"
import { IBook } from '../@types/book'
import { IBookLog } from '../@types/bookLog'

import './BookDetails.css'
import BookLogs from "../features/books/components/BookLogs"
import ReadingProgressBar from "../features/books/components/ReadingProgressbar"


export default function () {

  const bookService = new BookService()
  const bookLogService = new BookLogService()
  const [bookInfo, setBookInfo] = React.useState({} as IBook)
  const [bookLogs, setBookLogs] = React.useState<IBookLog[]>([])

  let { bookId } = useParams()

  React.useEffect(() => {
    async function loadBookDetails() {
      const bookInfo = await bookService.getById(Number(bookId));
      const bookLogs = await bookLogService.getAll(Number(bookId))
      setBookInfo(bookInfo)
      setBookLogs(bookLogs)
    }

    loadBookDetails()

  }, [bookId])

  return (
    <div className="book-details">
      <h1>{bookInfo.name}</h1>
      <ReadingProgressBar completed={Number(((bookInfo.readPages || 0) / (bookInfo.pages || 1)) * 100)} />
      <div className="book-detail-body">
        <div>
          <img src={bookInfo.image} className="book-details-image" />
        </div>
        <div className="book-details-description">
          <div className="book-details-pages">
            <p><strong>Author</strong>: {bookInfo.author}</p>
            <p><strong>Price</strong>: ${bookInfo.price}</p>
            <p><strong>Pages</strong>: {bookInfo.pages}</p>
            <p><strong>Read Pages</strong>: {bookInfo.readPages}</p>
          </div>
          <p><strong>Description</strong>: {bookInfo.description}</p>
          <p><strong>Feedback</strong>: {bookInfo.feedback}</p>
          <div className="title-and-actions">
            <h4>Logs</h4>
            <button>Add</button>
          </div>
          <BookLogs bookLogs={bookLogs} />
        </div>
      </div>
    </div>
  )
}