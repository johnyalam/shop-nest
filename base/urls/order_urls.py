from django.urls import path
from base.views import order_views as views

urlpatterns = [
    path('paypal/config/', views.getPayPalConfig, name='paypal-config'),
    path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/', views.getMyOrders, name='my-orders'),

    path('<str:pk>/', views.getOrderById, name='order-detail'),
    path('<str:pk>/paypal/create/', views.createPayPalOrder, name='paypal-create'),
    path('<str:pk>/paypal/capture/', views.capturePayPalOrder, name='paypal-capture'),

    path('', views.getOrders, name='orders'),                    # admin: all orders
    path('paypal/config/', views.getPayPalConfig, name='paypal-config'),
    path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/', views.getMyOrders, name='my-orders'),

    path('<str:pk>/', views.getOrderById, name='order-detail'),
    path('<str:pk>/deliver/', views.updateOrderToDelivered, name='order-deliver'),  # admin
    path('<str:pk>/paypal/create/', views.createPayPalOrder, name='paypal-create'),
    path('<str:pk>/paypal/capture/', views.capturePayPalOrder, name='paypal-capture'),
]