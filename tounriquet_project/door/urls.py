from django.urls import path
from .views import add_door, delete_door, update_door,view_door

urlpatterns = [
    path('create/', add_door, name='add_door'),
    path('delete/<int:DoorId>/', delete_door, name='delete_door'),
    path('update/<int:DoorId>/', update_door, name='update_door'), 
    path('all/', view_door, name='view_door'),

]
