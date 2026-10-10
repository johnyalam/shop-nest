import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Rating from './Rating'

function Product({ product }) {
  return (
    <Card className="product-card my-3 p-3 rounded">
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.image} alt={product.name} />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as="div">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div" className="my-3">
          <Rating value={Number(product.rating)} text={`${product.numReviews} reviews`} />
        </Card.Text>

        <Card.Text as="h3">€{product.price}</Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Product