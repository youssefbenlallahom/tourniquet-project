from django.urls import path
from .views import add_client, delete_client, update_client,view_client

urlpatterns = [
    path('create/', add_client, name='add_client'),
    path('delete/<int:client_id>/', delete_client, name='delete_client'),
    path('update/<int:client_id>/', update_client, name='update_client'), 
    path('all/', view_client, name='view_client'),

]
