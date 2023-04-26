import { IBookLog } from '../../../@types/bookLog'

interface BookLogsProps {
  bookLogs: IBookLog[]
}

export default function (props: BookLogsProps) {
  return (
    <div className="book-detail-logs">
      {props.bookLogs.map(log => (
        <div className="book-detail-logs-item">
          <div className="book-details-pages">
            <p>
              <strong>Read Pages:</strong> {log.readPages}
            </p>
            <p>
              <strong>Date:</strong> {log.date?.toString()}
            </p>
          </div>
          <p>
            <strong>Feedback:</strong>{log.feedback}
          </p>
        </div>
      ))}
    </div>
  )
}