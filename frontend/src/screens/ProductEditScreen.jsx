import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Button, Image } from 'react-bootstrap'
import FormContainer from '../components/FormContainer'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { getProductDetails } from '../slices/productSlice'
import {
  updateProduct, uploadProductImage, clearAdminProductErrors,
} from '../slices/adminProductSlice'

function ProductEditScreen() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { product, loading, error } = useSelector((state) => state.products.details)
  const { loading: saving, error: saveError, uploading, uploadError } =
    useSelector((state) => state.adminProducts)

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')

  useEffect(() => {
    dispatch(clearAdminProductErrors())
    dispatch(getProductDetails(id))
  }, [dispatch, id])

  useEffect(() => {
    if (product && String(product._id) === id) {
      setName(product.name || '')
      setPrice(product.price ?? 0)
      setImage(product.image || '')
      setBrand(product.brand || '')
      setCategory(product.category || '')
      setCountInStock(product.countInStock ?? 0)
      setDescription(product.description || '')
    }
  }, [product, id])

  const uploadHandler = (e) => {
    const file = e.target.files[0]
    if (!file) return
    dispatch(uploadProductImage({ id, file }))
      .unwrap()
      .then((updated) => setImage(updated.image))
      .catch(() => {})
    e.target.value = '' // allow choosing the same file again
  }

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateProduct({ id, name, price, brand, category, countInStock, description }))
      .unwrap()
      .then(() => navigate('/admin/productlist'))
      .catch(() => {})
  }

  return (
    <>
      <Link to="/admin/productlist" className="btn btn-light my-3">Go Back</Link>
      <FormContainer>
        <h1>Edit Product</h1>
        {saveError && <Message variant="danger">{saveError}</Message>}

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

            <Form.Group className="my-3" controlId="price">
              <Form.Label>Price (€, incl. VAT)</Form.Label>
              <Form.Control type="number" min="0" step="0.01" required value={price}
                onChange={(e) => setPrice(e.target.value)} />
            </Form.Group>

            <Form.Group className="my-3" controlId="image">
              <Form.Label>Image</Form.Label>
              {image && (
                <div className="mb-2">
                  <Image src={image} alt="Product" thumbnail style={{ maxHeight: 150 }} />
                </div>
              )}
              <Form.Control type="file" accept="image/jpeg,image/png,image/webp"
                onChange={uploadHandler} disabled={uploading} />
              <Form.Text muted>JPG, PNG or WEBP, max 5 MB. Uploads immediately.</Form.Text>
              {uploading && <Loader />}
              {uploadError && <Message variant="danger">{uploadError}</Message>}
            </Form.Group>

            <Form.Group className="my-3" controlId="brand">
              <Form.Label>Brand</Form.Label>
              <Form.Control type="text" value={brand}
                onChange={(e) => setBrand(e.target.value)} />
            </Form.Group>

            <Form.Group className="my-3" controlId="countInStock">
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control type="number" min="0" step="1" required value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)} />
            </Form.Group>

            <Form.Group className="my-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" value={category}
                onChange={(e) => setCategory(e.target.value)} />
            </Form.Group>

            <Form.Group className="my-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} value={description}
                onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={saving || uploading}>
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  )
}

export default ProductEditScreen