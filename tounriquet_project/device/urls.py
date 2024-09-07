from django.urls import path
from .views import add_device, delete_device, update_device,view_device,export_devices_to_json

urlpatterns = [
    path('create/', add_device, name='add_device'),
    path('delete/<int:DeviceId>/', delete_device, name='delete_device'),
    path('update/<int:DeviceId>/', update_device, name='update_device'), 
    path('all/', view_device, name='view_device'),
    path('export-json/', export_devices_to_json, name='export-json'),

]
