from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from base.models import Product
from base.serializers import ProductSerializer
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from PIL import Image
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from base.models import Product
from base.serializers import ProductSerializer, ProductUpdateSerializer

ALLOWED_IMAGE_FORMATS = {'JPEG', 'PNG', 'WEBP'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def bad_request(message):
    return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)

def not_found():
    return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def getProducts(request):
    keyword = request.query_params.get('keyword', '')
    products = (Product.objects
                .filter(name__icontains=keyword)
                .prefetch_related('review_set')
                .order_by('-createdAt'))

    paginator = Paginator(products, 8)
    page = request.query_params.get('page', 1)
    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)

    serializer = ProductSerializer(products, many=True)
    return Response({
        'products': serializer.data,
        'page': products.number,
        'pages': paginator.num_pages,
    })


@api_view(['GET'])
def getProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'},
                        status=status.HTTP_404_NOT_FOUND)
    return Response(ProductSerializer(product).data)

# ---------- Admin only ----------

@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    product = Product.objects.create(
        user=request.user,
        name='Sample name',
        price=0,
        brand='Sample brand',
        countInStock=0,
        category='Sample category',
        description='',
    )
    return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    product = Product.objects.filter(_id=pk).first()
    if product is None:
        return not_found()

    serializer = ProductUpdateSerializer(product, data=request.data, partial=True)
    if not serializer.is_valid():
        field, errors = next(iter(serializer.errors.items()))
        return bad_request(f'{field}: {errors[0]}')

    serializer.save()
    return Response(ProductSerializer(product).data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request, pk):
    product = Product.objects.filter(_id=pk).first()
    if product is None:
        return not_found()
    product.delete()
    return Response({'detail': 'Product deleted'})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def uploadImage(request, pk):
    product = Product.objects.filter(_id=pk).first()
    if product is None:
        return not_found()

    file = request.FILES.get('image')
    if not file:
        return bad_request('No image uploaded')
    if file.size > MAX_IMAGE_SIZE:
        return bad_request('Image must be 5 MB or smaller')

    # Check it's REALLY an image (not just named .jpg)
    try:
        img = Image.open(file)
        image_format = img.format
        img.verify()
    except Exception:
        return bad_request('File is not a valid image')
    if image_format not in ALLOWED_IMAGE_FORMATS:
        return bad_request('Only JPG, PNG and WEBP images are allowed')

    file.seek(0)  # verify() read the file - rewind before saving
    product.image = file
    product.save(update_fields=['image'])
    return Response(ProductSerializer(product).data)