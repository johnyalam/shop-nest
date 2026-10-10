import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button, Row, Col } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { login, clearUserMessages } from '../slices/userSlice'
import { safeRedirect } from '../utils/safeRedirect'

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))

  const { userInfo, loading, error } = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(clearUserMessages())
  }, [dispatch])

  useEffect(() => {
    if (userInfo) navigate(redirect, { replace: true })
  }, [userInfo, redirect, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <FormContainer>
      <h1>Sign In</h1>
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}

      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" required
            autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="my-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Enter password" required
            autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>Sign In</Button>
      </Form>

      <Row className="py-3">
        <Col>
          New customer?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`}>Register</Link>
        </Col>
      </Row>
    </FormContainer>
  )
}

export default LoginScreen