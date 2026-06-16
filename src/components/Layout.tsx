import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { View } from '../types/navigation'

type Props = {
  active: View
  onChange: (view: View) => void
  children: ReactNode
}

export default function Layout({ active, onChange, children }: Props) {
  return (
    <div className="app-root">
      <Sidebar active={active} onChange={onChange} />

      <div className="content-area">
        <TopBar />
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  )
}
