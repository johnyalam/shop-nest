from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from base.models import Product
from base.serializers import ProductSerializer


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