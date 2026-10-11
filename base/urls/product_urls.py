from django.urls import path
from base.views import product_views as views

urlpatterns = [
    path('', views.getProducts, name='products'),
    path('create/', views.createProduct, name='product-create'),
    path('top/', views.getTopProducts, name='top-products'),

    path('<str:pk>/', views.getProduct, name='product'),
    path('<str:pk>/reviews/', views.createProductReview, name='product-review'),
    path('<str:pk>/update/', views.updateProduct, name='product-update'),
    path('<str:pk>/delete/', views.deleteProduct, name='product-delete'),
    path('<str:pk>/upload/', views.uploadImage, name='product-upload'),
]