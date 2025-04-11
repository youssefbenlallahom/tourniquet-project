from django.urls import path
from .views import add_bracelet, delete_bracelet, update_bracelet,view_bracelet

urlpatterns = [
    path('create/', add_bracelet, name='add_bracelet'),
    path('delete/<int:BraceletId>/', delete_bracelet, name='delete_bracelet'),
    path('update/<int:BraceletId>/', update_bracelet, name='update_bracelet'), 
    path('all/', view_bracelet, name='view_bracelet'),

]
