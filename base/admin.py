from django.contrib import admin
from .models import Product, Review, Order, OrderItem, ShippingAddress


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('_id', 'name', 'brand', 'category', 'price', 'countInStock')
    search_fields = ('name', 'brand', 'category')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('_id', 'user', 'totalPrice', 'isPaid', 'isDelivered', 'createdAt')
    list_filter = ('isPaid', 'isDelivered')


admin.site.register(Review)
admin.site.register(OrderItem)
admin.site.register(ShippingAddress)
