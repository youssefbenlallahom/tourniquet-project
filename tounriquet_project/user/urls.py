from django.urls import path
from .views import login, logout, register, get_user, reset_password, request_password_reset, list_users, delete_user,update_user_permissions

urlpatterns = [
    path('profile/', get_user, name='get_user'),
    path('permissions/update/', update_user_permissions, name='permissions-update'),
    path('all/', list_users, name='list_users'),
    path('delete/<int:user_id>/', delete_user, name='delete_user'),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('request-password-reset/', request_password_reset, name='request_password_reset'),
    path('reset-password/', reset_password, name='reset_password')
]
