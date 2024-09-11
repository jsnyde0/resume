from django.shortcuts import render, redirect
from django.contrib import messages
import json

def view_home(request):
    return render(request, 'home.html')

def view_resume(request):
    skills_data = {
        "name": "Skills by Role",
        "children": [
            {
                "name": "Web Developer",
                "children": [
                    {
                        "name": "Back-End",
                        "children": [
                            {"name": "Django"},
                            {"name": "PostgreSQL, SQLite"}
                        ]
                    },
                    {
                        "name": "Front-end",
                        "children": [
                            {"name": "HTML, CSS"},
                            {"name": "HTMX, Tailwind, Cotton"},
                            {"name": "Chart.js, D3.js"},
                            {"name": "JavaScript (basic)"}
                        ]
                    },
                    {
                        "name": "Analytics",
                        "children": [
                            {"name": "Posthog"},
                            {"name": "GA4"},
                            {"name": "Server-side Tracking"}
                        ]
                    },
                    {
                        "name": "Deployment",
                        "children": [
                            {"name": "DigitalOcean"},
                            {"name": "Render.com"}
                        ]
                    },
                    {
                        "name": "Data Pipelines",
                        "children": [
                            {"name": "BigQuery"},
                            {"name": "Dataform"}
                        ]
                    }
                ]
            },
            {
                "name": "Data Scientist",
                "children": [
                    {"name": "Python, C++"},
                    {"name": "Algorithm and library development"},
                    {"name": "Machine Learning (Sci-kit Learn, Numpy, Pandas, ...)"},
                    {"name": "Bayesian Modelling (PyMC, MMM)"},
                    {"name": "Computer vision & Deep learning (OpenCV, Keras)"},
                    {"name": "Dashboarding (Looker)"}
                ]
            },
            {
                "name": "Growth Engineer",
                "children": [
                    {"name": "Performance marketing (FB, Google, TikTok)"},
                    {"name": "Growth Experimenting"},
                    {"name": "SEO"},
                    {"name": "CRO"},
                    {"name": "Marketing Automation (Affiliate, Email, ...)"}
                ]
            },
            {
                "name": "Ex-Founder",
                "children": [
                    {"name": "Vision & Strategy"},
                    {"name": "HR & Team (Holacracy)"},
                    {"name": "Finance"},
                    {"name": "Sales"},
                    {"name": "Project Management (Asana, GTD)"},
                    {"name": "Learning from failures"}
                ]
            }
        ]
    }

    context = {
        'skills_data': json.dumps(skills_data)
    }

    return render(request, 'resume.html', context)

def download_cv(request):
    messages.warning(request, "All this effort for an online resume, and you want a PDF? (I just haven't had the time yet)")
    return redirect('resume')