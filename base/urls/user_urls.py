from django.urls import path
from base.views import user_views as views

urlpatterns = [
    path('login/', views.MyTokenObtainPairView.as_view(), name='login'),
    path('register/', views.registerUser, name='register'),
    path('profile/', views.getUserProfile, name='user-profile'),
    path('profile/update/', views.updateUserProfile, name='user-profile-update'),

    # admin
    path('', views.getUsers, name='users'),
    path('<str:pk>/', views.getUserById, name='user-detail'),
    path('<str:pk>/update/', views.updateUser, name='user-update'),
    path('<str:pk>/delete/', views.deleteUser, name='user-delete'),
]