import { FC, ReactNode } from 'react'
import { Link } from "react-router-dom";

import "./Card.css"

interface CardHeaderProps {
  title: string;
  bookId: number;
}

export const CardHeader: FC<CardHeaderProps> = ({ title, bookId }) => {
  return (
    <div className="card-header">
      <Link to={`/detail/${bookId}`}>{title}</Link>
    </div>
  )
}


interface CardBodyProps {
  children: ReactNode;
}

export const CardBody: FC<CardBodyProps> = ({ children }) => {
  return (
    <div className="card-body">
      {children}
    </div>
  )
}

interface CardImageProps {
  img: string;
}

export const CardImage: FC<CardImageProps> = ({ img }) => {
  return (
    <div className="card-image">
      <img src={img}/>
    </div>
  )
}

interface CardProps {
  children: ReactNode;
}

export const Card: FC<CardProps> = ({ children }) => {
  return (
    <div className="card">
      {children}
    </div>
  )
}
