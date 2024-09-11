from django.shortcuts import render, redirect
from django.contrib import messages
import json

def view_home(request):
    return render(request, 'home.html')

def view_resume(request):
    skills_data = {
        "name": "Skills",
        "children": [
            {
                "name": "PROGRAMMING",
                "children": [
                    {"name": "Python"},
                    {"name": "C++"},
                    {"name": "SQL"}
                ]
            },
            {
                "name": "DATA",
                "children": [
                    {
                        "name": "Data Science",
                        "children": [
                            {"name": "Data Analysis and Modeling (Sci-kit Learn, Numpy, Pandas)"},
                            {"name": "Bayesian Inference (PyMC)"}
                        ]
                    },
                    {
                        "name": "Technical Marketing",
                        "children": [
                            {"name": "Data Pipelines (BigQuery, Dataform)"},
                            {"name": "Dashboards (Looker Studio)"},
                            {"name": "Server-side Tracking (Server GTM)"},
                            {"name": "Analytics (Posthog, GA4, Amplitude)"}
                        ]
                    }
                ]
            },
            # ... other categories ...
        ]
    }

    context = {
        'skills_data': json.dumps(skills_data)
    }

    return render(request, 'resume.html', context)

def download_cv(request):
    messages.warning(request, "All this effort for an online resume, and you want a PDF? (I just haven't had the time yet)")
    return redirect('resume')