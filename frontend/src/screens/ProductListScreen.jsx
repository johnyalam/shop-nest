import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Row, Col } from 'react-bootstrap'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listProducts } from '../slices/productSlice'
import { createProduct, deleteProduct, clearAdminProductErrors, } from '../slices/adminProductSlice'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Paginate from '../components/Paginate'

function ProductListScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const { products, page: currentPage, pages, loading, error } = useSelector((state) => state.products.list)

  const { loading: working, error: adminError } = useSelector((state) => state.adminProducts)
  

  useEffect(() => {
    dispatch(clearAdminProductErrors())
    dispatch(listProducts({ page }))
  }, [dispatch, page])

  const createHandler = () => {
    dispatch(createProduct())
      .unwrap()
      .then((product) => navigate(`/admin/product/${product._id}/edit`))
      .catch(() => {}) // error is shown from the slice
  }

  const deleteHandler = (product) => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      dispatch(deleteProduct(product._id))
        .unwrap()
        .then(() => dispatch(listProducts({ page })))
        .catch(() => {})
    }
  }

  return (
    <>
      <Row className="align-items-center">
        <Col><h1>Products</h1></Col>
        <Col className="text-end">
          <Button className="my-3" onClick={createHandler} disabled={working}>
            <i className="fas fa-plus me-1"></i> Create Product
          </Button>
        </Col>
      </Row>

      {adminError && <Message variant="danger">{adminError}</Message>}

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td><Link to={`/product/${product._id}`}>{product.name}</Link></td>
                <td>€{product.price}</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>{product.countInStock}</td>
                <td>
                  <Button as={Link} to={`/admin/product/${product._id}/edit`}
                    variant="light" size="sm" aria-label={`Edit ${product.name}`}>
                    <i className="fas fa-edit"></i>
                  </Button>{' '}
                  <Button variant="danger" size="sm" disabled={working}
                    aria-label={`Delete ${product.name}`} onClick={() => deleteHandler(product)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Paginate pages={pages} page={currentPage} basePath="/admin/productlist" />
        </>
      )}
      
    </>
  )
}

export default ProductListScreen