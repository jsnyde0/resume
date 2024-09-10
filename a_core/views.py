from django.shortcuts import render, redirect
from django.contrib import messages

def view_home(request):
    return render(request, 'home.html')

def view_resume(request):
    return render(request, 'resume.html')

def download_cv(request):
    messages.warning(request, "All this effort for an online resume, and you want a PDF? (I just haven't had the time yet)")
    return redirect('resume')