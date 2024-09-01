from django.urls import path
from .views import login, logout, register,get_user
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
     
) 
urlpatterns = [
    path('user/', get_user, name='get_user'),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]