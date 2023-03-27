import React, { FC, ReactNode } from 'react'
import './Grid.css'

interface GridProps {
  children: ReactNode
}

export const Grid: FC<GridProps> = ({children}) => {
  return (
    <div className="grid">
      {children}
    </div>
  )
}
