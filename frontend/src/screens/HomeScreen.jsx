import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col } from 'react-bootstrap'
import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Paginate from '../components/Paginate'
import ProductCarousel from '../components/ProductCarousel'
import { listProducts } from '../slices/productSlice'

function HomeScreen() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const page = Number(searchParams.get('page')) || 1

  const { products, page: currentPage, pages, loading, error } = useSelector((state) => state.products.list)

  useEffect(() => {
    dispatch(listProducts({ keyword, page }))
  }, [dispatch, keyword, page])

  return (
    <>
      {keyword ? (
        <Link to="/" className="btn btn-light mb-3">Go Back</Link>
      ) : (
        <ProductCarousel />
      )}

      <h1>{keyword ? `Results for "${keyword}"` : 'Latest Products'}</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : products.length === 0 ? (
        <Message>No products found.</Message>
      ) : (
        <>
          <Row>
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate pages={pages} page={currentPage} keyword={keyword} />
        </>
      )}
    </>
  )
}

export default HomeScreen