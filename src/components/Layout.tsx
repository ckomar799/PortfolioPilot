import type { ReactNode } from 'react'
import TopBar from './TopBar'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="app-root">
      <div className="content-area">
        <TopBar />
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  )
}
