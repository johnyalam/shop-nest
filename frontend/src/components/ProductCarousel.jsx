import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Carousel, Image } from 'react-bootstrap'
import Loader from './Loader'
import Message from './Message'
import { listTopProducts } from '../slices/productSlice'

function ProductCarousel() {
  const dispatch = useDispatch()
  const { products, loading, error } = useSelector((state) => state.products.top)

  useEffect(() => {
    dispatch(listTopProducts())
  }, [dispatch])

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>
  if (products.length === 0) return null

  return (
    <Carousel pause="hover" className="bg-dark mb-4">
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/product/${product._id}`}>
            <Image src={product.image} alt={product.name} fluid />
            <Carousel.Caption className="carousel-caption">
              <h4>{product.name} (€{product.price})</h4>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  )
}

export default ProductCarousel