import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button, Row, Col, Table } from 'react-bootstrap'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { updateProfile, clearUserMessages } from '../slices/userSlice'
import { listMyOrders } from '../slices/orderSlice'

function ProfileScreen() {
  const dispatch = useDispatch()
  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector((state) => state.user)

  const [name, setName] = useState(userInfo.name)
  const [email, setEmail] = useState(userInfo.email)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState(null)
  const { orders, loading: ordersLoading, error: ordersError } =
  useSelector((state) => state.orders.mine)

  useEffect(() => {
    dispatch(clearUserMessages())
    dispatch(listMyOrders())
  }, [dispatch])

  const submitHandler = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    setFormError(null)
    dispatch(updateProfile({ name, email, password }))
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>
        {(formError || updateError) && (
          <Message variant="danger">{formError || updateError}</Message>
        )}
        {updateSuccess && <Message variant="success">Profile updated</Message>}
        {updateLoading && <Loader />}

        <Form onSubmit={submitHandler}>
          <Form.Group className="my-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" required value={name}
              onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          <Form.Group className="my-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group className="my-3" controlId="password">
            <Form.Label>New Password</Form.Label>
            <Form.Control type="password" placeholder="Leave blank to keep current"
              autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>

          <Form.Group className="my-3" controlId="confirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control type="password" autoComplete="new-password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={updateLoading}>Update</Button>
        </Form>
      </Col>

      <Col md={9}>
        <h2>My Orders</h2>
        {ordersLoading ? (
          <Loader />
        ) : ordersError ? (
          <Message variant="danger">{ordersError}</Message>
        ) : orders.length === 0 ? (
          <Message>You have no orders yet. <Link to="/">Start shopping</Link></Message>
        ) : (
          <Table striped responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>€{order.totalPrice}</td>
                  <td>
                    {order.isPaid ? order.paidAt.substring(0, 10)
                      : <i className="fas fa-times" style={{ color: 'red' }}></i>}
                  </td>
                  <td>
                    {order.isDelivered ? order.deliveredAt.substring(0, 10)
                      : <i className="fas fa-times" style={{ color: 'red' }}></i>}
                  </td>
                  <td>
                    <Button as={Link} to={`/order/${order._id}`} variant="light" size="sm">
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
</Col>
    </Row>
  )
}

export default ProfileScreen