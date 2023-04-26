import React, { FC } from 'react'

import { IBook } from '../../../@types/book'
import { Card, CardBody, CardHeader, CardImage } from '../../../components/Card'
import { Chip } from '../../../components/Chip'
import { Grid } from '../../../components/Grid'
import "./BookList.css"
import ReadingProgressBar from './ReadingProgressbar'

interface BookListProps {
  list: IBook[]
}

export const BookList: FC<BookListProps> = ({ list }) => {

  return (
    <Grid>
      {list.map((book: IBook) => (
        <Card>
          <CardImage img={book.image || ""} />
          <CardHeader title={book.name} bookId={book.id} />
          <CardBody>
            <ReadingProgressBar completed={Number(((book.readPages || 0) / (book.pages || 1)) * 100)} />
            <div className="star-container">
              <Chip filled />
              <Chip filled />
              <Chip />
              <Chip />
              <Chip />
            </div>
            <div>
              {book.description}
            </div>
          </CardBody>
        </Card>
      ))}
    </Grid>
  )
}
