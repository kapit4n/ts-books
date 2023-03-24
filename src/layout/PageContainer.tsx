import { FC, ReactNode } from "react"

interface Props {
  children?: ReactNode
}

export const PageContainer: FC<Props> = ({ children }) => {

  return (
    <div>
      {children}
    </div>
  )
}

export default PageContainer;