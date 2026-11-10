type Props = { title: string; intro: string }

// Short banner at the top of the inner pages.
const PageHeader = ({ title, intro }: Props) => (
  <section className="page-header">
    <div className="container">
      <h1>{title}</h1>
      <p>{intro}</p>
    </div>
  </section>
)

export default PageHeader
