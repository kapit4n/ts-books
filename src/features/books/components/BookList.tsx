import React, { FC } from 'react'

import { IBook } from '../../../@types/book'
import { Card, CardBody, CardHeader, CardImage } from '../../../components/Card'
import { Grid } from '../../../components/Grid'


interface BookListProps {
  list: IBook[]
}

export const BookList: FC<BookListProps> = ({ list }) => {
  return (
    <Grid>
      {list.map((book: IBook) => (
        <Card>
          <CardImage img={book.image || ""} />
          <CardHeader title={book.name} />
          <CardBody>
            <div>
              {book.description}
            </div>
          </CardBody>
        </Card>
      ))}
    </Grid>
  )
}
