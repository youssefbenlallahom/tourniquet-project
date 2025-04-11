from django.urls import path
from .views import *

urlpatterns = [
    path('create/', add_assignment, name='add_assignment'),
    path('delete/<int:AssignmentId>/', delete_assignment, name='delete_assignment'),
    path('update/<int:id>/', update_assignment, name='update_assignment'), 
    path('all/', view_assignment, name='view_assignment'),
    path('access/create/', add_assignment_access, name='add_assignment_access'),
    path('access/delete/<int:Assignment_accessId>/', delete_assignment_access, name='delete_assignment_access'),
    path('access/update/<int:Assignment_accessId>/', update_assignment_access, name='update_assignment_access'), 
    path('access/all/', view_assignment_access, name='view_assignment_access'),
    path('execute-command-assignment/', execute_assignment_command, name='execute_assignment_command'),

]
