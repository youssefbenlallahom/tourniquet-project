from django.urls import path
from .views import add_clientAuth, delete_clientAuth, update_clientAuth,view_clientAuth

urlpatterns = [
    path('create/', add_clientAuth, name='add_clientAuth'),
    path('delete/<int:clientAuth_id>/', delete_clientAuth, name='delete_clientAuth'),
    path('update/<int:clientAuth_id>/', update_clientAuth, name='update_clientAuth'), 
    path('all/', view_clientAuth, name='view_clientAuth'),

]
