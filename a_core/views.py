import json

from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import redirect, render

from .utils import create_sunburst_plot, get_skills_data, prepare_sunburst_data


def view_home(request):
    if request.htmx:
        return render(request, "partials/pages/home.html")
    return render(request, "home.html")


def view_resume(request):
    skills_data = get_skills_data()
    sunburst_data = prepare_sunburst_data(skills_data)
    sunburst_plot = create_sunburst_plot(sunburst_data)

    context = {"skills_data": json.dumps(skills_data), "sunburst_plot": sunburst_plot}

    if request.htmx:
        return render(request, "partials/pages/resume.html", context)
    return render(request, "resume.html", context)


def view_readme(request):
    if request.htmx:
        return render(request, "partials/pages/readme_md.html")
    return render(request, "readme_md.html")


def view_projects(request):
    if request.htmx:
        return render(request, "partials/pages/projects.html")
    return render(request, "projects.html")


def download_cv(request):
    messages.warning(
        request,
        "All this effort for an online resume, and you want a PDF? (I just \
        haven't had the time yet)",
    )
    return redirect("resume")


def view_ask(request):
    if request.htmx:
        return HttpResponse("Hello, world!")
