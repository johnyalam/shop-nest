import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap'
import Rating from '../components/Rating'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { addToCart } from '../slices/cartSlice'
import { getProductDetails, createReview } from '../slices/productSlice'

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
  dispatch(addToCart({
    product: product._id,
    name: product.name,
    image: product.image,
    price: Number(product.price),
    countInStock: product.countInStock,
    qty,
  }))
  navigate('/cart')
}

const { userInfo } = useSelector((state) => state.user)
const { loading: reviewLoading, error: reviewError } =
  useSelector((state) => state.products.review)
const [rating, setRating] = useState(0)
const [comment, setComment] = useState('')

const submitReviewHandler = (e) => {
  e.preventDefault()
  dispatch(createReview({ id, rating, comment }))
    .unwrap()
    .then(() => {
      setRating(0)
      setComment('')
    })
    .catch(() => {})
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

      <Row className="mt-4">
        <Col md={6}>
          <h4>Reviews</h4>
          {product.reviews.length === 0 && <Message>No reviews yet.</Message>}

          <ListGroup variant="flush">
            {product.reviews.map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating value={review.rating} />
                <p className="text-muted small mb-1">{review.createdAt.substring(0, 10)}</p>
                {review.comment && <p>{review.comment}</p>}
              </ListGroup.Item>
            ))}

            <ListGroup.Item>
              <h4>Write a Review</h4>
              {reviewError && <Message variant="danger">{reviewError}</Message>}

              {userInfo ? (
                <Form onSubmit={submitReviewHandler}>
                  <Form.Group className="my-2" controlId="rating">
                    <Form.Label>Rating</Form.Label>
                    <Form.Select value={rating} required
                      onChange={(e) => setRating(Number(e.target.value))}>
                      <option value="">Select...</option>
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Fair</option>
                      <option value="3">3 - Good</option>
                      <option value="4">4 - Very Good</option>
                      <option value="5">5 - Excellent</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="my-2" controlId="comment">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control as="textarea" rows={3} maxLength={1000} value={comment}
                      onChange={(e) => setComment(e.target.value)} />
                  </Form.Group>

                  <Button type="submit" variant="primary" disabled={reviewLoading}>
                    Submit
                  </Button>
                </Form>
              ) : (
                <Message>
                  Please{' '}
                  <Link to={`/login?redirect=${encodeURIComponent(`/product/${id}`)}`}>sign in</Link>{' '}
                  to write a review.
                </Message>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </>
  )
}

export default ProductScreen