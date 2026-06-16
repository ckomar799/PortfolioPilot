const tools = [
  { title: 'Dividend Calculator', desc: 'Project your dividend income' },
  { title: 'Compound Growth', desc: 'See your money grow' },
  { title: 'Lump Sum vs DCA', desc: 'Compare strategies' },
  { title: 'Retirement Calculator', desc: 'Plan retirement income' },
]

export default function ToolsGrid() {
  return (
    <div className="tools-grid">
      {tools.map((t) => (
        <div className="tool-card" key={t.title}>
          <div className="tool-title">{t.title}</div>
          <div className="tool-desc">{t.desc}</div>
        </div>
      ))}
    </div>
  )
}
