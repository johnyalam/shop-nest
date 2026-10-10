import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button, Row, Col } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { register, clearUserMessages } from '../slices/userSlice'
import { safeRedirect } from '../utils/safeRedirect'

function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState(null)

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
    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    setFormError(null)
    dispatch(register({ name, email, password }))
  }

  return (
    <FormContainer>
      <h1>Register</h1>
      {(formError || error) && <Message variant="danger">{formError || error}</Message>}
      {loading && <Loader />}

      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="Enter name" required
            autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Group>

        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" required
            autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="my-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="At least 8 characters" required
            autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>

        <Form.Group className="my-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control type="password" placeholder="Repeat password" required
            autoComplete="new-password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>Register</Button>
      </Form>

      <Row className="py-3">
        <Col>
          Have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>Sign In</Link>
        </Col>
      </Row>
    </FormContainer>
  )
}

export default RegisterScreen