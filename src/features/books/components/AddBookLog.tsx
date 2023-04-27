import React, { FC } from "react";
import { IBookLog } from "../../../@types/bookLog";

interface AddBookLogProps {
  onAddBookLog: (bookLog: IBookLog) => void;
  bookId: number;
}

export const AddBookLog: FC<AddBookLogProps> = ({ onAddBookLog, bookId }) => {
  const [readPages, setReadPages] = React.useState(0)
  const [feedback, setFeedback] = React.useState("")
  return (
    <div className="add-book-log">
      <div>
        <strong>Read Pages</strong><input type="number" value={readPages} onChange={e => setReadPages(Number(e.target.value))} />
      </div>
      <strong>Feddback</strong><textarea rows={10} cols={50} value={feedback} onChange={e => setFeedback(e.target.value)} />
      <div className="actions">
        <button onClick={() => onAddBookLog({readPages, feedback, bookId, date: new Date()} as IBookLog)}>Save</button>
        <button>Cancel</button>
      </div>
    </div>
  )
}