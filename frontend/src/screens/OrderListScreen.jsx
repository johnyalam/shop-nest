import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button } from 'react-bootstrap'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listAllOrders } from '../slices/orderSlice'

const cross = <i className="fas fa-times" style={{ color: 'red' }}></i>

function OrderListScreen() {
  const dispatch = useDispatch()
  const { orders, loading, error } = useSelector((state) => state.orders.all)

  useEffect(() => {
    dispatch(listAllOrders())
  }, [dispatch])

  return (
    <>
      <h1>Orders</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : orders.length === 0 ? (
        <Message>No orders yet.</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
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
                <td>{order.user ? order.user.name : <em>deleted user</em>}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>€{order.totalPrice}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : cross}</td>
                <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : cross}</td>
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
    </>
  )
}

export default OrderListScreen