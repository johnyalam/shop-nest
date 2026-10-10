import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button, Col } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import { savePaymentMethod } from '../slices/cartSlice'

function PaymentScreen() {
  const { shippingAddress, paymentMethod: saved } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState(saved || 'PayPal')

  useEffect(() => {
    if (!shippingAddress.address) navigate('/shipping')
  }, [shippingAddress, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(savePaymentMethod(paymentMethod))
    navigate('/placeorder')
  }

  return (
    <FormContainer>
      <CheckoutSteps current={3} />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3">
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check type="radio" id="paypal" name="paymentMethod"
              label="PayPal or Credit Card" value="PayPal"
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)} />
          </Col>
        </Form.Group>
        <Button type="submit" variant="primary">Continue</Button>
      </Form>
    </FormContainer>
  )
}

export default PaymentScreen