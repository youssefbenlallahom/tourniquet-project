from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Assignment, AccessPeriod
from .serializers import AssignmentSerializer, AccessPeriodSerializer
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from collections import defaultdict
import os
import json
from datetime import datetime
from dateutil import parser
from django.core.exceptions import ObjectDoesNotExist
import subprocess
from functools import wraps
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

def user_has_permission(user):
    return user.is_superuser or user.is_staff or user.can_manage_assignment

def update_json_after_operation(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        try:
            # Exécuter la vue originale
            response = view_func(*args, **kwargs)
            
            # Si la réponse indique un succès (status code 2xx)
            if 200 <= response.status_code < 300:
                try:
                    generate_detailed_assignments_json()
                except Exception as e:
                    logger.error(f"Erreur lors de la mise à jour du fichier JSON: {str(e)}")
                    # On continue malgré l'erreur de mise à jour du fichier
            
            return response
            
        except Exception as e:
            logger.error(f"Erreur dans la vue {view_func.__name__}: {str(e)}")
            return Response(
                {'error': 'Une erreur est survenue lors du traitement de la requête.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return wrapper

def execute_command(command, cwd=None, timeout=3):
    try:
        process = subprocess.Popen(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            shell=True,
            cwd=cwd
        )
        try:
            stdout, stderr = process.communicate(timeout=timeout)
        except subprocess.TimeoutExpired:
            process.terminate()
            stdout, stderr = process.communicate()
        return {
            'stdout': stdout.decode('utf-8') if stdout else '',
            'stderr': stderr.decode('utf-8') if stderr else '',
            'returncode': process.returncode
        }
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        return {
            'stdout': '',
            'stderr': str(e),
            'returncode': -1
        }

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def execute_assignment_command(request):
    try:
        # Execute dotnet command with JSON file
        command = "dotnet run dispatch-user detailed_assignment.json"
        result = execute_command(command, cwd=r"C:\Users\youssef\Desktop\tourniquet-project-final\Game-Production")
        
        if result['returncode'] == 0:
            return Response({
                "message": "Command executed successfully",
                "output": result['stdout'],
                "status": "success"
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Command executed with errors",
                "output": result['stderr'] if result['stderr'] else result['stdout'],
                "status": "error"
            }, status=status.HTTP_200_OK)  # Still return 200 to display the error in the frontend
    
    except Exception as e:
        logger.error(f"Unexpected error in execute_assignment_command: {str(e)}")
        return Response({
            "error": f"An unexpected error occurred: {str(e)}",
            "status": "error",
            "output": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def view_assignment(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Fetch all assignments with their access periods
    assignments = Assignment.objects.all().prefetch_related('access_periods')
    if assignments.exists():
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No assignments found.'}, status=status.HTTP_404_NOT_FOUND)

def generate_assignments_json():
    assignments = Assignment.objects.all().prefetch_related('access_periods')
    
    if not assignments.exists():
        return None
        
    assignment_data = []
    
    for assignment in assignments:
        access_periods = []
        for period in assignment.access_periods.all():
            access_periods.append({
                "access_type": period.access_type,
                "startTime": period.startTime.isoformat() if period.startTime else None,
                "endTime": period.endTime.isoformat() if period.endTime else None
            })
            
        assignment_data.append({
            "id": assignment.id,
            "name": assignment.name,
            "braceletId": assignment.braceletId,
            "color": assignment.color,
            "role": assignment.role,
            "access_periods": access_periods
        })
    
    # Save to JSON file in the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'assignments.json')
    
    with open(file_path, 'w') as f:
        json.dump(assignment_data, f, indent=4)
        
    return file_path

def generate_detailed_assignments_json():
    # Define room mapping from database to JSON fields
    rooms = {
        "ChillRoom": "ChillRoom",
        "GameOn": "GameOn",
        "Office": "Office",
        "Escape1": "Escape1",
        "Escape2": "Escape2",
        "Escape3": "Escape3",
        "AxeThrowing": "AxeThrowing",
    }
    
    # Get the most recent assignment
    assignments = Assignment.objects.all().prefetch_related('access_periods').order_by('-id')
    
    # Initialize person data
    person_data = None
    
    # Process the first assignment found
    for assignment in assignments:
        if not assignment:
            continue
            
        # Create person entry with basic info
        person_data = {
            "name": assignment.name,
            "cardNo": assignment.braceletId,
            "pin": "",
            "color": assignment.color,
            "isSuper": assignment.role.lower() == "gm",
            "isAdmin": False,
            "startHour": 0,  # This will be set to the earliest startHour
            "numberOfHours": 0  # Will be updated with sum of all access hours
        }
        
        # Initialize room access objects with default values
        for room_name in rooms.values():
            person_data[room_name] = {
                "access": 0,
                "startHour": 0,
                "numberOfHours": 0
            }
        
        earliest_start_hour = None
        total_hours = 0  # Initialize sum of hours
        
        # Process each access period
        for period in assignment.access_periods.all():
            room_name = rooms.get(period.access_type)
            if not room_name or not period.startTime or not period.endTime:
                continue
                
            # Convert UTC time to local time
            local_start_time = timezone.localtime(period.startTime)
            local_end_time = timezone.localtime(period.endTime)
            
            # Parse start/end time to get hours - use local time
            start_hour = (local_start_time.hour * 100 + local_start_time.minute)//10
            
            # Calculate duration in hours
            duration = (local_end_time - local_start_time).total_seconds() / 3600
            nbrH = int(round(duration))
            
            # Add to total hours
            total_hours += nbrH
            
            # Update room access data
            person_data[room_name] = {
                "access": 1,
                "startHour": int(start_hour),
                "numberOfHours": nbrH
            }
            
            # Track the earliest start hour
            if earliest_start_hour is None or start_hour < earliest_start_hour:
                earliest_start_hour = start_hour
        
        # Set the main startHour to the earliest among all periods
        if earliest_start_hour is not None:
            person_data["startHour"] = earliest_start_hour
            
        # Set the numberOfHours to the sum of all access hours
        person_data["numberOfHours"] = total_hours
        
        # We've processed one assignment, so break the loop
        break

    # If no valid assignments were found, create empty data
    if person_data is None:
        person_data = {}

    # Save to JSON file in the current directory
    current_dir = "C:\\Users\\youssef\\Desktop\\tourniquet-project-final\\Game-Production"
    file_path = os.path.join(current_dir, 'detailed_assignment.json')

    with open(file_path, 'w') as f:
        json.dump(person_data, f, indent=4)

    return file_path

# Add an assignment with multiple access periods
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def add_assignment(request):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Extract access_periods data from the request
    data = request.data
    access_periods_data = data.pop('access_periods', [])
    
    serializer = AssignmentSerializer(data=data, context={'access_periods': access_periods_data})
    
    if serializer.is_valid():
        assignment = serializer.save()
        return Response({
            'assignment': AssignmentSerializer(assignment).data,
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete an assignment and all its access periods
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def delete_assignment(request, AssignmentId):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        assignment = Assignment.objects.get(id=AssignmentId)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    assignment.delete()  # This will also delete all related access periods due to CASCADE

    return Response({
        'message': 'Assignment deleted successfully.',
    }, status=status.HTTP_204_NO_CONTENT)

# Update an assignment and its access periods
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def update_assignment(request, id):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        assignment_instance = Assignment.objects.get(id=id)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Extract access_periods data from the request
    data = request.data
    access_periods_data = data.pop('access_periods', [])
    access_periods_action = data.pop('access_periods_action', None)  # 'replace' or None
    
    serializer = AssignmentSerializer(
        assignment_instance, 
        data=data, 
        partial=True,
        context={
            'access_periods': access_periods_data,
            'access_periods_action': access_periods_action
        }
    )
    
    if serializer.is_valid():
        updated_assignment = serializer.save()
        return Response({
            'assignment': AssignmentSerializer(updated_assignment).data,
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# New endpoint to manage access periods directly
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@update_json_after_operation
def manage_access_period(request, assignment_id):
    if not user_has_permission(request.user):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    action = request.data.get('action')
    
    if action == 'add':
        period_data = request.data.get('period')
        period_data['assignment'] = assignment.id
        serializer = AccessPeriodSerializer(data=period_data)
        
        if serializer.is_valid():
            period = serializer.save(assignment=assignment)
            return Response(AccessPeriodSerializer(period).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif action == 'update':
        period_id = request.data.get('period_id')
        period_data = request.data.get('period')
        
        try:
            period = AccessPeriod.objects.get(id=period_id, assignment=assignment)
        except AccessPeriod.DoesNotExist:
            return Response({'error': 'Access period not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = AccessPeriodSerializer(period, data=period_data, partial=True)
        
        if serializer.is_valid():
            updated_period = serializer.save()
            return Response(AccessPeriodSerializer(updated_period).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif action == 'delete':
        period_id = request.data.get('period_id')
        
        try:
            period = AccessPeriod.objects.get(id=period_id, assignment=assignment)
        except AccessPeriod.DoesNotExist:
            return Response({'error': 'Access period not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        period.delete()
        return Response({'message': 'Access period deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
        
    else:
        return Response({'error': 'Invalid action specified.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([])  # No authentication required for this endpoint
def get_all_rt_log(request):
    try:
        # First check if ZKTeco server is already running
        check_command = "Get-Process -Name ZktecoLogServer -ErrorAction SilentlyContinue"
        check_result = execute_command(check_command, timeout=5)
        
        # If the server is already running, don't try to start it again
        if check_result['stdout'].strip():
            logger.info("ZKTeco server is already running")
            response = Response({
                "message": "ZKTeco log server is already running",
                "output": "Server already active at http://localhost:5125/logHub",
                "status": "success"
            }, status=status.HTTP_200_OK)
        else:
            # Start the ZKTeco log server if not already running
            command = "dotnet run"
            result = execute_command(command, cwd=r"C:\Users\youssef\Desktop\tourniquet-project-final\ZktecoLogServer")
            response = Response({
                "message": "ZKTeco log server started successfully",
                "output": result['stdout'],
                "status": "success" if result['returncode'] == 0 else "error"
            }, status=status.HTTP_200_OK)
        
        # Set appropriate content negotiation and CORS headers
        response["Content-Type"] = "application/json"
        response["Accept"] = "*/*"
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    except Exception as e:
        logger.error(f"Unexpected error in get_all_rt_log: {str(e)}")
        return Response({
            "error": f"An unexpected error occurred: {str(e)}",
            "status": "error",
            "output": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([])  # No authentication required for this endpoint
def stop_rt_log(request):
    try:
        # Kill the ZKTeco log server process if it's running
        command = "Stop-Process -Name ZktecoLogServer -Force -ErrorAction SilentlyContinue"
        result = execute_command(command, timeout=5)
        
        # Check if the process was successfully killed
        check_command = "Get-Process -Name ZktecoLogServer -ErrorAction SilentlyContinue"
        check_result = execute_command(check_command, timeout=5)
        
        if not check_result['stdout'].strip():
            response = Response({
                "message": "ZKTeco log server stopped successfully",
                "output": "Server has been terminated",
                "status": "success"
            }, status=status.HTTP_200_OK)
        else:
            response = Response({
                "message": "Failed to stop ZKTeco log server",
                "output": "Server process could not be terminated",
                "status": "error"
            }, status=status.HTTP_200_OK)
        
        # Set appropriate content negotiation and CORS headers
        response["Content-Type"] = "application/json"
        response["Accept"] = "*/*"
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    except Exception as e:
        logger.error(f"Unexpected error in get_all_rt_log: {str(e)}")
        return Response({
            "error": f"An unexpected error occurred: {str(e)}",
            "status": "error",
            "output": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




