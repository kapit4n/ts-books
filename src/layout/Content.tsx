import { FC, ReactNode } from "react"
import './Content.css'

interface Props {
  children?: ReactNode
}

export const Content: FC<Props> = ({ children }) => {

  return (
    <div className="content">
      {children}
    </div>
  )
}

export default Content;