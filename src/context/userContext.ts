import React from 'react'
import { IUser } from '../@types/user'

export const UserContext = React.createContext<IUser | null>(null)
