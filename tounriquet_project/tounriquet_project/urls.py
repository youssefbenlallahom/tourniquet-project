"""
URL configuration for tounriquet_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/',include('user.urls')),
    path('timezone/',include('timezone.urls')),
    path('client/',include('client.urls')),
    path('clientAuth/',include('clientAuth.urls')),
    path('device/',include('device.urls')),
    path('access/',include('access.urls')),
    path('door/',include('door.urls')),
    path('role/',include('role.urls')),
    path('assignment/',include('assignment.urls')),
]