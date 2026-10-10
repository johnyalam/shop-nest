import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import { saveShippingAddress } from '../slices/cartSlice'

function ShippingScreen() {
  const { shippingAddress } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
  const [country, setCountry] = useState(shippingAddress.country || 'Finland')

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(saveShippingAddress({ address, city, postalCode, country }))
    navigate('/payment')
  }

  return (
    <FormContainer>
      <CheckoutSteps current={2} />
      <h1>Shipping</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3" controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control type="text" placeholder="Street and number" required
            autoComplete="street-address" value={address}
            onChange={(e) => setAddress(e.target.value)} />
        </Form.Group>

        <Form.Group className="my-3" controlId="city">
          <Form.Label>City</Form.Label>
          <Form.Control type="text" placeholder="e.g. Helsinki" required
            autoComplete="address-level2" value={city}
            onChange={(e) => setCity(e.target.value)} />
        </Form.Group>

        <Form.Group className="my-3" controlId="postalCode">
          <Form.Label>Postal Code</Form.Label>
          <Form.Control type="text" placeholder="e.g. 00100" required
            autoComplete="postal-code" value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)} />
        </Form.Group>

        <Form.Group className="my-3" controlId="country">
          <Form.Label>Country</Form.Label>
          <Form.Control type="text" required
            autoComplete="country-name" value={country}
            onChange={(e) => setCountry(e.target.value)} />
        </Form.Group>

        <Button type="submit" variant="primary">Continue</Button>
      </Form>
    </FormContainer>
  )
}

export default ShippingScreen