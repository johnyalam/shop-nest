import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import Message from '../components/Message'
import Loader from '../components/Loader'
import CheckoutSteps from '../components/CheckoutSteps'
import { createOrder, resetCreateOrder } from '../slices/orderSlice'
import { calcPrices, VAT_RATE } from '../config'

function PlaceOrderScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const cart = useSelector((state) => state.cart)
  const { order, loading, error } = useSelector((state) => state.orders.create)
  const prices = calcPrices(cart.cartItems)

  // Make sure earlier steps are done
  useEffect(() => {
    if (!cart.shippingAddress.address) navigate('/shipping')
    else if (!cart.paymentMethod) navigate('/payment')
  }, [cart.shippingAddress, cart.paymentMethod, navigate])

  // When the order is created, go to its page
  useEffect(() => {
    if (order) {
      navigate(`/order/${order._id}`)
      dispatch(resetCreateOrder())
    }
  }, [order, navigate, dispatch])

  const placeOrderHandler = () => {
    dispatch(createOrder({
      orderItems: cart.cartItems.map((i) => ({ product: i.product, qty: i.qty })),
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
    }))
  }

  return (
    <>
      <CheckoutSteps current={4} />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                {cart.shippingAddress.address}, {cart.shippingAddress.postalCode}{' '}
                {cart.shippingAddress.city}, {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>{cart.paymentMethod}</p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty. <Link to="/">Go shopping</Link></Message>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item) => (
                    <ListGroup.Item key={item.product}>
                      <Row className="align-items-center">
                        <Col xs={2} md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} × €{item.price.toFixed(2)} = €{(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item><h2>Order Summary</h2></ListGroup.Item>
              <ListGroup.Item>
                <Row><Col>Items:</Col><Col>€{prices.itemsPrice}</Col></Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row><Col>Shipping:</Col><Col>€{prices.shippingPrice}</Col></Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row><Col><strong>Total:</strong></Col><Col><strong>€{prices.totalPrice}</strong></Col></Row>
                <small className="text-muted">
                  incl. VAT {(VAT_RATE * 100).toFixed(1)}%: €{prices.vatIncluded}
                </small>
              </ListGroup.Item>

              {error && (
                <ListGroup.Item><Message variant="danger">{error}</Message></ListGroup.Item>
              )}

              <ListGroup.Item>
                <Button type="button" className="w-100"
                  disabled={cart.cartItems.length === 0 || loading}
                  onClick={placeOrderHandler}>
                  Place Order
                </Button>
                {loading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PlaceOrderScreen