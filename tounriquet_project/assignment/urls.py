from django.urls import path
from .views import *

urlpatterns = [
    path('create/', add_assignment, name='add_assignment'),
    path('delete/<int:AssignmentId>/', delete_assignment, name='delete_assignment'),
    path('update/<int:id>/', update_assignment, name='update_assignment'), 
    path('all/', view_assignment, name='view_assignment'),
    path('execute-command-assignment/', execute_assignment_command, name='execute_assignment_command'),
    path('get-all-rt-log/', get_all_rt_log, name='get_all_rt_log_stream'),
    path('stop-rt-log/', stop_rt_log, name='stop_rt_log'),
    path('access-period/<int:assignment_id>/', manage_access_period, name='manage_access_period'),
]
