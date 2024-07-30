from django.urls import path
from .views import add_timezones, delete_timezones, update_timezones,view_timezones

urlpatterns = [
    path('create/', add_timezones, name='add_timezones'),
    path('delete/<int:TimezoneId>/', delete_timezones, name='delete_timezones'),
    path('update/<int:TimezoneId>/', update_timezones, name='update_timezones'), 
    path('all/', view_timezones, name='view_timezones'),

]
