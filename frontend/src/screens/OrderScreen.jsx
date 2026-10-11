import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder } from '../slices/orderSlice'
import { VAT_RATE } from '../config'

const formatDate = (iso) => new Date(iso).toLocaleString('fi-FI')

function OrderScreen() {
  const { id } = useParams()
  const dispatch = useDispatch()

  const { userInfo } = useSelector((state) => state.user)
  const { order, loading, error } = useSelector((state) => state.orders.details)
  const { loading: payLoading, error: payError } = useSelector((state) => state.orders.pay)

  const [paypalConfig, setPaypalConfig] = useState(null)
  const [paypalError, setPaypalError] = useState(null)

  useEffect(() => {
    dispatch(getOrderDetails(id))
  }, [dispatch, id])

  // Load the PayPal client ID only for unpaid orders
  useEffect(() => {
    if (order && !order.isPaid && !paypalConfig) {
      axios.get('/api/orders/paypal/config/')
        .then(({ data }) => setPaypalConfig(data))
        .catch(() => setPaypalError('Could not load PayPal'))
    }
  }, [order, paypalConfig])

  // Called by the PayPal button: our server creates the PayPal payment
  const createPayPalOrder = async () => {
    setPaypalError(null)
    const { data } = await axios.post(
      `/api/orders/${order._id}/paypal/create/`, {},
      { headers: { Authorization: `Bearer ${userInfo.token}` } })
    return data.id
  }

  // Called after the customer approves in the PayPal popup
  const onApprove = (data) => {
    dispatch(payOrder({ orderId: order._id, paypalOrderId: data.orderID }))
  }

  if (loading || (!order && !error)) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  const itemsPrice = order.orderItems
    .reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    .toFixed(2)
  const isOwner = order.user && order.user._id === userInfo._id
  const showPayPal = !order.isPaid && isOwner

  return (
    <>
      <h1>Order #{order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p><strong>Name: </strong>{order.user?.name}</p>
              <p>
                <strong>Email: </strong>
                <a href={`mailto:${order.user?.email}`}>{order.user?.email}</a>
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress?.address}, {order.shippingAddress?.postalCode}{' '}
                {order.shippingAddress?.city}, {order.shippingAddress?.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">Delivered on {formatDate(order.deliveredAt)}</Message>
              ) : (
                <Message variant="warning">Not delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment</h2>
              <p><strong>Method: </strong>{order.paymentMethod}</p>
              {order.isPaid ? (
                <Message variant="success">Paid on {formatDate(order.paidAt)}</Message>
              ) : (
                <Message variant="warning">Not paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col xs={2} md={1}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>
                      <Col>
                        {item.product ? (
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        ) : (
                          item.name
                        )}
                      </Col>
                      <Col md={4}>
                        {item.qty} × €{item.price} = €{(item.qty * Number(item.price)).toFixed(2)}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item><h2>Order Summary</h2></ListGroup.Item>
              <ListGroup.Item>
                <Row><Col>Items:</Col><Col>€{itemsPrice}</Col></Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row><Col>Shipping:</Col><Col>€{order.shippingPrice}</Col></Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row><Col><strong>Total:</strong></Col><Col><strong>€{order.totalPrice}</strong></Col></Row>
                <small className="text-muted">
                  incl. VAT {(VAT_RATE * 100).toFixed(1)}%: €{order.taxPrice}
                </small>
              </ListGroup.Item>

              {showPayPal && (
                <ListGroup.Item>
                  {(paypalError || payError) && (
                    <Message variant="danger">{paypalError || payError}</Message>
                  )}
                  {payLoading || !paypalConfig ? (
                    <Loader />
                  ) : (
                    <PayPalScriptProvider options={{
                      clientId: paypalConfig.clientId,
                      currency: paypalConfig.currency,
                      intent: 'capture',
                    }}>
                      <PayPalButtons
                        style={{ layout: 'vertical' }}
                        createOrder={createPayPalOrder}
                        onApprove={onApprove}
                        onError={() => setPaypalError('PayPal payment failed. Please try again.')}
                      />
                    </PayPalScriptProvider>
                  )}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen