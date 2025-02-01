from django.urls import path
from .views import add_userRole, delete_userRole, update_userRole,view_userRole

urlpatterns = [
    path('create/', add_userRole, name='add_userRole'),
    path('delete/<int:UserRoleId>/', delete_userRole, name='delete_userRole'),
    path('update/<int:UserRoleId>/', update_userRole, name='update_userRole'), 
    path('all/', view_userRole, name='view_userRole'),

]
