import { useContext } from 'react'
import { UserContext } from "../context/userContext"


export default function () {
  const user = useContext(UserContext)

  return (
    <div>{user?.username} at Home Page</div>
  )
}