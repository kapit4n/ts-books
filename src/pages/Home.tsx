import { useContext, useState, useEffect } from 'react'
import { IBook } from '../@types/book'
import { UserContext } from "../context/userContext"
import { BookList } from '../features/books/components/BookList'
import BooksService from '../features/books/services/books'

export default function () {
  const user = useContext(UserContext)
  const [books, setBooks] = useState<IBook[]>([])
  const bs = new BooksService();

  useEffect(() => {
    async function getBooks() {
      bs.getAll().then(books => setBooks(books))    
    }
    getBooks()
    
  }, [])

  return (
    <div>
      <div>{user?.username}</div>
        <BookList list={books} />
    </div>
  )
}
