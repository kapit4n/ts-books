import React from "react"
import moment from "moment"

import { useParams } from 'react-router-dom'
import BookService from "../features/books/services/books"
import BookLogService from "../features/books/services/bookLogs"
import { IBook } from '../@types/book'
import { IBookLog } from '../@types/bookLog'

import './BookDetails.css'
import BookLogs from "../features/books/components/BookLogs"
import ReadingProgressBar from "../features/books/components/ReadingProgressbar"
import { AddBookLog } from "../features/books/components/AddBookLog"

export default function () {
  const bookService = new BookService()
  const bookLogService = new BookLogService()
  const [bookInfo, setBookInfo] = React.useState({} as IBook)
  const [bookLogs, setBookLogs] = React.useState<IBookLog[]>([])
  const [addBookLogFlag, setAddBookLogFlag] = React.useState(false)

  let { bookId } = useParams()

  const enableBookLogFlag = () => {
    setAddBookLogFlag(true)
  }

  const disableAddBookLogFlag = () => {
    setAddBookLogFlag(false)
  }

  const onAddBookLog = async (bookLog: IBookLog) => {
    await bookLogService.save(bookLog);
    pullBookLogs();
    pullBookInfo()
    disableAddBookLogFlag();
  }

  const onRemoveBookLog = async (bookLogId: number) => {
    await bookLogService.delete(bookLogId);
    pullBookLogs();
    pullBookInfo()
  }

  const pullBookLogs = async () => {
    const bookLogs = await bookLogService.getAll(Number(bookId))
    // sort descendant
    setBookLogs(bookLogs.sort((a, b) => new Date(a.date || "") > new Date(b.date || "") ? -1 : 1))
  }

  const pullBookInfo = async () => {
    const bookInfo = await bookService.getById(Number(bookId));
    setBookInfo(bookInfo)
  }

  React.useEffect(() => {
    async function loadBookDetails() {
      pullBookInfo()
      pullBookLogs()
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
          <div className="book-details-pages">
            <p><strong>Start Reading</strong>: {moment(bookInfo.startReadingDate).fromNow()}</p>
          </div>
          <div className="book-details-pages">
            <p><strong>Last Reading</strong>: {moment(bookInfo.lastReadingDate).fromNow()}</p>
          </div>
          <p><strong>Description</strong>: {bookInfo.description}</p>
          <p><strong>Feedback</strong>: {bookInfo.feedback}</p>
          {
            !addBookLogFlag && (
              <div className="title-and-actions">
                <h4>Logs</h4>
                <button onClick={enableBookLogFlag}>Add</button>
              </div>

            )
          }
          {
            addBookLogFlag && (
              <div className="title-and-actions">
                <div>
                  <AddBookLog onAddBookLog={onAddBookLog} bookId={Number(bookId)} />
                </div>
              </div>
            )
          }
          <BookLogs bookLogs={bookLogs} onRemoveBookLog={onRemoveBookLog} />
        </div>
      </div>
    </div>
  )
}