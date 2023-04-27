import moment from "moment";
import { IBookLog } from '../../../@types/bookLog'

import "./BookLogs.css"
interface BookLogsProps {
  bookLogs: IBookLog[];
  onRemoveBookLog: (bookLogId: number) => void
}

export default function (props: BookLogsProps) {
  return (
    <div className="book-detail-logs">
      {props.bookLogs.map(log => (
        <div className="book-detail-logs-item">
          <div className="book-details-pages">
            <p className="book-details-read-pages">
              <strong>Read </strong> <span>{log.readPages}</span> Pages
            </p>
            <p className="book-details-date">
              <strong>Date: </strong> {moment(log.date).fromNow()}
            </p>
          </div>
          <p>
            <strong>Feedback: </strong>{log.feedback}
          </p>
          <div className="actions">
            <button onClick={() => props.onRemoveBookLog(log.id)}>x</button>
          </div>
        </div>
      ))}
    </div>
  )
}