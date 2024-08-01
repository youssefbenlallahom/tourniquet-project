from django.urls import path
from .views import add_role, delete_role, update_role,view_role

urlpatterns = [
    path('create/', add_role, name='add_role'),
    path('delete/<int:RoleId>/', delete_role, name='delete_role'),
    path('update/<int:RoleId>/', update_role, name='update_role'), 
    path('all/', view_role, name='view_role'),

]
