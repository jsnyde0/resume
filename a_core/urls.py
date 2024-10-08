"""
URL configuration for a_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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
from django.urls import path, include
from .views import view_home, view_resume, view_readme, download_cv, view_projects

urlpatterns = [
    path('thebaws/', admin.site.urls),
	path('admin/', include('admin_honeypot.urls', namespace='admin_honeypot')),
    path('', view_home, name='home'),
    path('resume/', view_resume, name='resume'),
    path('readme/', view_readme, name='readme'),
    path('projects/', view_projects, name='projects'),
    path('download_cv/', download_cv, name='download_cv'),
]
