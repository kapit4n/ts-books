import React, { FC, ReactNode } from 'react'

interface CardHeaderProps {
  title: string;
}

export const CardHeader: FC<CardHeaderProps> = ({ title }) => {
  return (
    <div>
      {title}
    </div>
  )
}


interface CardBodyProps {
  children: ReactNode;
}

export const CardBody: FC<CardBodyProps> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
}

interface CardProps {
  children: ReactNode;
}

export const Card: FC<CardProps> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
}
