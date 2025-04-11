from django.urls import path
from .views import add_access, delete_access, update_access,view_access

urlpatterns = [
    path('create/', add_access, name='add_access'),
    path('delete/<int:id>/', delete_access, name='delete_access'),
    path('update/<int:id>/', update_access, name='update_access'), 
    path('all/', view_access, name='view_access'),

]
