import { Pagination } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Paginate({ pages, page, keyword = '', basePath = '/' }) {
  if (pages <= 1) return null

  const linkFor = (p) => {
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (p > 1) params.set('page', p)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <Pagination className="justify-content-center my-3">
      {[...Array(pages).keys()].map((x) => (
        <Pagination.Item key={x + 1} as={Link} to={linkFor(x + 1)} active={x + 1 === page}>
          {x + 1}
        </Pagination.Item>
      ))}
    </Pagination>
  )
}

export default Paginate