import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getUser, updateUser, resetUserUpdate } from '../slices/adminUserSlice'

function UserEditScreen() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo } = useSelector((state) => state.user)
  const { user, loading, error } = useSelector((state) => state.adminUsers.edit)
  const { loading: updating, error: updateError, success } =
    useSelector((state) => state.adminUsers.update)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  // Load the user
  useEffect(() => {
    dispatch(resetUserUpdate())
    dispatch(getUser(id))
  }, [dispatch, id])

  // Fill the form once loaded
  useEffect(() => {
    if (user && String(user._id) === id) {
      setName(user.name)
      setEmail(user.email)
      setIsAdmin(user.isAdmin)
    }
  }, [user, id])

  // After saving, go back to the list
  useEffect(() => {
    if (success) {
      dispatch(resetUserUpdate())
      navigate('/admin/userlist')
    }
  }, [success, dispatch, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateUser({ id, name, email, isAdmin }))
  }

  const isSelf = String(userInfo._id) === id

  return (
    <>
      <Link to="/admin/userlist" className="btn btn-light my-3">Go Back</Link>
      <FormContainer>
        <h1>Edit User</h1>
        {updateError && <Message variant="danger">{updateError}</Message>}
        {updating && <Loader />}

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
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

            <Form.Group className="my-3" controlId="isadmin">
              <Form.Check type="checkbox" label="Is Admin"
                checked={isAdmin} disabled={isSelf}
                onChange={(e) => setIsAdmin(e.target.checked)} />
              {isSelf && (
                <Form.Text muted>You can't remove your own admin rights.</Form.Text>
              )}
            </Form.Group>

            <Button type="submit" variant="primary" disabled={updating}>Update</Button>
          </Form>
        )}
      </FormContainer>
    </>
  )
}

export default UserEditScreen