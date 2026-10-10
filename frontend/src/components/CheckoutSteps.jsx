import { Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const STEPS = [
  { label: 'Login', to: '/login' },
  { label: 'Shipping', to: '/shipping' },
  { label: 'Payment', to: '/payment' },
  { label: 'Place Order', to: '/placeorder' },
]

// current = number of the active step (1–4); earlier steps are clickable
function CheckoutSteps({ current }) {
  return (
    <Nav className="justify-content-center mb-4">
      {STEPS.map((step, i) => (
        <Nav.Item key={step.to}>
          {i + 1 <= current ? (
            <Nav.Link as={Link} to={step.to} active={i + 1 === current}>
              {step.label}
            </Nav.Link>
          ) : (
            <Nav.Link disabled>{step.label}</Nav.Link>
          )}
        </Nav.Item>
      ))}
    </Nav>
  )
}

export default CheckoutSteps