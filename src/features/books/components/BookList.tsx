import React, { FC } from 'react'

import { IBook } from '../../../@types/book'
import { Card, CardBody, CardHeader } from '../../../components/Card'


interface BookListProps {
  list: IBook[]
}

export const BookList: FC<BookListProps> = ({ list }) => {
  return (
    <div>
      {list.map((book: IBook) => (
        <Card>
          <CardHeader title={book.name} />
          <CardBody>
            <div>
              {book.description}
            </div>
          </CardBody>
        </Card>
      ))}

    </div>
  )
}