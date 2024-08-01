from django.urls import path
from .views import add_assignment, delete_assignment, update_assignment,view_assignment

urlpatterns = [
    path('create/', add_assignment, name='add_assignment'),
    path('delete/<int:AssignmentId>/', delete_assignment, name='delete_assignment'),
    path('update/<int:AssignmentId>/', update_assignment, name='update_assignment'), 
    path('all/', view_assignment, name='view_assignment'),

]
