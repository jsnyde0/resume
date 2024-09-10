from django.shortcuts import render

def view_home(request):
    return render(request, 'home.html')

def view_resume(request):
    return render(request, 'resume.html')