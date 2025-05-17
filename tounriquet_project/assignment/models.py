from django.db import models

class Assignment(models.Model):
    braceletId = models.CharField(max_length=100)
    color = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.name} - {self.braceletId}"

class AccessPeriod(models.Model):
    ACCESS_CHOICES = [
        ('ChillRoom', 'ChillRoom'),
        ('GameOn', 'GameOn'),
        ('Office', 'Office'),
        ('Escape1', 'Escape1'),
        ('Escape2', 'Escape2'),
        ('Escape3', 'Escape3'),
        ('AxeThrowing', 'AxeThrowing'),
    ]
    
    assignment = models.ForeignKey(Assignment, related_name='access_periods', on_delete=models.CASCADE)
    access_type = models.CharField(max_length=50, choices=ACCESS_CHOICES)
    startTime = models.DateTimeField()
    endTime = models.DateTimeField()
    
    def __str__(self):
        return f"{self.assignment.name} - {self.access_type}"
