import { FC, ReactNode } from 'react'

import "./Card.css"

interface CardHeaderProps {
  title: string;
}

export const CardHeader: FC<CardHeaderProps> = ({ title }) => {
  return (
    <div className="card-header">
      {title}
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
