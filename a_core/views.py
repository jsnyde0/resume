import json
from collections import deque

from django.contrib import messages
from django.http import HttpResponse, StreamingHttpResponse
from django.shortcuts import redirect, render

from .services import JonatanBot
from .utils import create_sunburst_plot, get_skills_data, prepare_sunburst_data

question_queue = deque()


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


def ask_jonatan(request):
    if request.method == "POST":
        question = request.POST.get("question", "").strip()
        if question:
            question_queue.append(question)
            # Return the empty form again
            return render(request, "cotton/ask_jonatan_form.html")
    return HttpResponse(status=405)


def stream_response(request):
    def event_stream():
        if question_queue:  # If there's a question waiting
            question = question_queue.popleft()
            jonatanbot = JonatanBot()
            for token in jonatanbot.generate(query=question):
                yield f"data: {token}\n\n"
        else:
            # Send an initial message to establish the connection
            yield "data: Connected\n\n"

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")
