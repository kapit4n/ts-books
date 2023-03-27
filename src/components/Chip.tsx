import { FC } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'

interface ChipProps {
  filled?: boolean;
}

export const Chip: FC<ChipProps> = ({ filled =false }) => {
  return (
    <FontAwesomeIcon style={{ color: filled? "greenyellow": 'gray' }} icon={faStar} />
  )
}
