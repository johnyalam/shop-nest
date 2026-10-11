import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'

function SearchBox() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const current = searchParams.get('keyword') || ''
  const [keyword, setKeyword] = useState(current)

  // keep the box in sync when the URL changes (e.g. "Go Back")
  useEffect(() => {
    setKeyword(current)
  }, [current])

  const submitHandler = (e) => {
    e.preventDefault()
    const k = keyword.trim()
    navigate(k ? `/?keyword=${encodeURIComponent(k)}` : '/')
  }

  return (
    <Form onSubmit={submitHandler} className="d-flex my-2 my-lg-0 ms-lg-3" role="search">
      <Form.Control
        type="search"
        placeholder="Search products..."
        aria-label="Search products"
        className="me-2"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Button type="submit" variant="outline-light">Search</Button>
    </Form>
  )
}

export default SearchBox