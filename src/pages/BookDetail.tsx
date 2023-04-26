import React from "react"

import { useParams } from 'react-router-dom'
import BookService from "../features/books/services/books"
import BookLogService from "../features/books/services/bookLogs"
import { IBook } from '../@types/book'
import { IBookLog } from '../@types/bookLog'

import './BookDetails.css'

interface ProgressBarProps {
  completed: number;
}

const ProgressBar = (props: ProgressBarProps) => {
  const { completed } = props;


  const styles: { [key: string]: React.CSSProperties } = {
    containerStyles: {
      height: 20,
      width: '100%',
      backgroundColor: "#e0e0de",
      borderRadius: 50,
      margin: 50
    },

    fillerStyles: {
      height: '100%',
      width: `${completed}%`,
      backgroundColor: 'red',
      borderRadius: 'inherit',
      textAlign: 'right'
    },

    labelStyles: {
      padding: 5,
      color: 'white',
      fontWeight: 'bold'
    }
  }

  return (
    <div style={styles.containerStyles}>
      <div style={styles.fillerStyles}>
        <span style={styles.labelStyles}>{`${completed}%`}</span>
      </div>
    </div>
  );
};

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
      <ProgressBar completed={Number(((bookInfo.readPages || 0) / (bookInfo.pages || 1)) * 100)} />
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
          <div className="book-detail-logs">
            {bookLogs.map(log => (
              <div className="book-detail-logs-item">
                <p>
                  <strong>Read Pages:</strong>{log.readPages}, <strong>Date:</strong>{log.date?.toString()},
                </p>
                <p>
                  <strong>Feedback:</strong>{log.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}