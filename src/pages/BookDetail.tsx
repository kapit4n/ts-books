import { useParams } from 'react-router-dom'

export default function() {

  let { bookId} = useParams()

  return <div>Book Detail {bookId}</div>
}