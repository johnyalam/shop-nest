from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from base.models import Product, Order, OrderItem, ShippingAddress
from base.serializers import OrderSerializer
from django.utils import timezone
from base.paypal import PayPalError, create_paypal_order, capture_paypal_order
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class OrderError(Exception):
    """A problem with the customer's order (shown to them as a message)."""


def money(value):
    return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def bad_request(message):
    return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addOrderItems(request):
    items = request.data.get('orderItems') or []
    address = request.data.get('shippingAddress') or {}
    payment_method = request.data.get('paymentMethod') or ''

    # --- 1. Validate the basics ---
    if not items:
        return bad_request('No order items')

    fields = ['address', 'city', 'postalCode', 'country']
    if any(not str(address.get(f, '')).strip() for f in fields):
        return bad_request('Shipping address is incomplete')

    if payment_method not in settings.SHOP_PAYMENT_METHODS:
        return bad_request('Invalid payment method')

    # --- 2. Create everything in ONE transaction ---
    try:
        with transaction.atomic():
            order = Order.objects.create(user=request.user, paymentMethod=payment_method)
            items_price = Decimal('0')

            for item in items:
                try:
                    qty = int(item.get('qty'))
                except (TypeError, ValueError):
                    raise OrderError('Invalid quantity')
                if qty < 1:
                    raise OrderError('Invalid quantity')

                product = (Product.objects.select_for_update()
                           .filter(_id=item.get('product')).first())
                if product is None or product.price is None:
                    raise OrderError('A product in your cart is no longer available')
                if product.countInStock < qty:
                    raise OrderError(
                        f'Only {product.countInStock} of "{product.name}" left in stock')

                OrderItem.objects.create(
                    product=product,
                    order=order,
                    name=product.name,
                    qty=qty,
                    price=product.price,               # price from the DATABASE
                    image=product.image.url if product.image else '',
                )
                items_price += product.price * qty

                product.countInStock -= qty
                product.save(update_fields=['countInStock'])

            # --- 3. Calculate totals on the server ---
            shipping_price = (Decimal('0') if items_price >= settings.SHOP_FREE_SHIPPING_FROM
                              else settings.SHOP_SHIPPING_PRICE)
            total = items_price + shipping_price
            rate = settings.SHOP_VAT_RATE
            vat_included = total * rate / (1 + rate)

            order.shippingPrice = money(shipping_price)
            order.taxPrice = money(vat_included)
            order.totalPrice = money(total)
            order.save()

            ShippingAddress.objects.create(
                order=order,
                address=address['address'].strip(),
                city=address['city'].strip(),
                postalCode=address['postalCode'].strip(),
                country=address['country'].strip(),
                shippingPrice=order.shippingPrice,
            )
    except OrderError as e:
        return bad_request(str(e))

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    orders = (request.user.order_set
              .prefetch_related('orderitem_set')
              .select_related('shippingaddress')
              .order_by('-createdAt'))
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request, pk):
    order = Order.objects.filter(_id=pk).first()
    if order is None:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_staff and order.user != request.user:
        return Response({'detail': 'Not authorized to view this order'},
                        status=status.HTTP_403_FORBIDDEN)

    return Response(OrderSerializer(order).data)


def paypal_error(e):
    return Response({'detail': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
def getPayPalConfig(request):
    # Client ID is public - it's needed to show the PayPal button
    return Response({'clientId': settings.PAYPAL_CLIENT_ID, 'currency': settings.SHOP_CURRENCY})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createPayPalOrder(request, pk):
    order = Order.objects.filter(_id=pk, user=request.user).first()
    if order is None:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    if order.isPaid:
        return bad_request('Order is already paid')

    try:
        paypal_id = create_paypal_order(order)
    except PayPalError as e:
        return paypal_error(e)

    order.paymentId = paypal_id
    order.save(update_fields=['paymentId'])
    return Response({'id': paypal_id})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def capturePayPalOrder(request, pk):
    paypal_id = request.data.get('paypalOrderId')

    with transaction.atomic():
        order = Order.objects.select_for_update().filter(_id=pk, user=request.user).first()
        if order is None:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        if order.isPaid:
            return bad_request('Order is already paid')
        if not paypal_id or paypal_id != order.paymentId:
            return bad_request('This payment does not belong to this order')

        try:
            result = capture_paypal_order(paypal_id)
        except PayPalError as e:
            return paypal_error(e)

        try:
            capture = result['purchase_units'][0]['payments']['captures'][0]
            amount = capture['amount']
            paid_value = Decimal(amount['value'])
        except (KeyError, IndexError, TypeError, ArithmeticError):
            return paypal_error('Unexpected response from PayPal')

        verified = (
            result.get('status') == 'COMPLETED'
            and capture.get('status') == 'COMPLETED'
            and amount.get('currency_code') == settings.SHOP_CURRENCY
            and paid_value == order.totalPrice
        )
        if not verified:
            return bad_request('Payment could not be verified. Please contact us.')

        order.isPaid = True
        order.paidAt = timezone.now()
        order.paymentCaptureId = capture.get('id')
        order.save()

    return Response(OrderSerializer(order).data)

# ---------- Admin only ----------

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getOrders(request):
    orders = (Order.objects
              .select_related('user', 'shippingaddress')
              .prefetch_related('orderitem_set')
              .order_by('-createdAt'))
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateOrderToDelivered(request, pk):
    order = Order.objects.filter(_id=pk).first()
    if order is None:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    if not order.isPaid:
        return bad_request('Order has not been paid yet')
    if order.isDelivered:
        return bad_request('Order is already marked as delivered')

    order.isDelivered = True
    order.deliveredAt = timezone.now()
    order.save()
    return Response(OrderSerializer(order).data)