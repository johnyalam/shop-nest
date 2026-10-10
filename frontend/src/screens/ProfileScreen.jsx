import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button, Row, Col } from 'react-bootstrap'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { updateProfile, clearUserMessages } from '../slices/userSlice'

function ProfileScreen() {
  const dispatch = useDispatch()
  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector((state) => state.user)

  const [name, setName] = useState(userInfo.name)
  const [email, setEmail] = useState(userInfo.email)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    dispatch(clearUserMessages())
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
        <Message>Your orders will appear here.</Message>
      </Col>
    </Row>
  )
}

export default ProfileScreen