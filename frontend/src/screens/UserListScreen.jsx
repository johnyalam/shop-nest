import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button } from 'react-bootstrap'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listUsers, deleteUser } from '../slices/adminUserSlice'

function UserListScreen() {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.user)
  const { users, loading, error } = useSelector((state) => state.adminUsers.list)
  const deleteError = useSelector((state) => state.adminUsers.deleteError)

  useEffect(() => {
    dispatch(listUsers())
  }, [dispatch])

  const deleteHandler = (user) => {
    if (window.confirm(`Delete ${user.email}? This cannot be undone.`)) {
      dispatch(deleteUser(user._id))
    }
  }

  return (
    <>
      <h1>Users</h1>
      {deleteError && <Message variant="danger">{deleteError}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user._id === userInfo._id
              return (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}{isSelf && ' (you)'}</td>
                  <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                  <td>
                    {user.isAdmin
                      ? <i className="fas fa-check" style={{ color: 'green' }}></i>
                      : <i className="fas fa-times" style={{ color: 'red' }}></i>}
                  </td>
                  <td>
                    <Button as={Link} to={`/admin/user/${user._id}/edit`}
                      variant="light" size="sm" aria-label={`Edit ${user.email}`}>
                      <i className="fas fa-edit"></i>
                    </Button>{' '}
                    <Button variant="danger" size="sm" disabled={isSelf}
                      aria-label={`Delete ${user.email}`} onClick={() => deleteHandler(user)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default UserListScreen