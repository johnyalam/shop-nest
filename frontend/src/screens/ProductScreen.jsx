import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap'
import Rating from '../components/Rating'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getProductDetails } from '../slices/productSlice'

function ProductScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [qty, setQty] = useState(1)

  const { product, loading, error } = useSelector((state) => state.products.details)

  useEffect(() => {
    dispatch(getProductDetails(id))
  }, [dispatch, id])

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}`)
  }

  if (loading || (!product && !error)) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  const inStock = product.countInStock > 0

  return (
    <>
      <Link to="/" className="btn btn-light my-3">Go Back</Link>

      <Row>
        <Col md={6}>
          <Image src={product.image} alt={product.name} fluid />
        </Col>

        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item><h3>{product.name}</h3></ListGroup.Item>
            <ListGroup.Item>
              <Rating value={Number(product.rating)} text={`${product.numReviews} reviews`} />
            </ListGroup.Item>
            <ListGroup.Item>Price: €{product.price}</ListGroup.Item>
            <ListGroup.Item>{product.description}</ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Price:</Col>
                  <Col><strong>€{product.price}</strong></Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Status:</Col>
                  <Col>{inStock ? 'In Stock' : 'Out of Stock'}</Col>
                </Row>
              </ListGroup.Item>

              {inStock && (
                <ListGroup.Item>
                  <Row className="align-items-center">
                    <Col>Qty</Col>
                    <Col>
                      <Form.Select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}

              <ListGroup.Item>
                <Button className="w-100" type="button"
                  disabled={!inStock} onClick={addToCartHandler}>
                  Add to Cart
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ProductScreen